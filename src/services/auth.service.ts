import { badRequest } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';
import { deleteS3Image } from '../middlewares/multer.uploader';
import randomImg from '../../randomImg';

const rand = Math.floor(Math.random() * 30);
const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };
const { salt } = process.env as { salt: string };
const { S3_BUCKET_URL } = process.env as { S3_BUCKET_URL: string };

class AuthService {
  authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository(prisma);
  }

  public emailCheck = async (email: string) => {
    const check = await this.authRepository.emailCheck(email);

    return check;
  };

  public localSignup = async (
    email: string,
    password: string,
    userName: string,
    state1: string,
    state2: string,
    profileImage?: string
  ) => {
    const check = await this.authRepository.emailCheck(email);
    if (check) throw badRequest('사용 중인 이메일');

    const date = new Date();
    const seed = Number(date) % 20;

    const hash = await bcrypt.hash(password, Number(salt));
    const result = await this.authRepository.createUser(
      email,
      userName,
      hash,
      state1,
      state2,
      profileImage || `random/${seed}.png`
    );
    return result;
  };

  public localLogin = async (email: string, password: string) => {
    const user = await this.authRepository.emailCheck(email);
    if (!user) throw badRequest('이메일/비밀번호 불일치');
    if (!user.password) throw badRequest('로컬 회원 아님');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw badRequest('이메일/비밀번호 불일치');

    const accessToken = await jwt.sign(
      { userId: user.userId, userName: user.userName, state1: user.state1, state2: user.state2 },
      JWT_SECRET_KEY,
      {
        expiresIn: '30s',
      }
    );

    const refreshToken = await jwt.sign({}, JWT_SECRET_KEY, {
      expiresIn: '14d',
    });

    await this.authRepository.saveToken(user.userId, accessToken, refreshToken);

    return {
      userId: user.userId,
      userName: user.userName,
      userImage: !user.kakao
        ? `${process.env.S3_BUCKET_URL}/profile/${user.userImage}`
        : user.userImage,
      state1: user.state1,
      state2: user.state2,
      accessToken,
      refreshToken,
    };
  };

  public detailUser = async (userId: number) => {
    const userInfo = await this.authRepository.userInfo(userId);

    if (!userInfo) throw badRequest('요구사항에 맞지 않는 입력값');
    else {
      let imageUrl = userInfo.userImage;
      if (!userInfo.kakao || !userInfo.userImage.includes('http://'))
        imageUrl = `${process.env.S3_BUCKET_URL}/profile/${userInfo?.userImage}`;

      const scoreAvg =
        // eslint-disable-next-line no-unsafe-optional-chaining
        userInfo.Score?.reduce((sum: number, curValue: any) => {
          return sum + curValue.score;
        }, 0) / userInfo.Score.length;

      return {
        userId: userInfo.userId,
        userName: userInfo.userName,
        userImage: imageUrl,
        email: userInfo.email,
        state1: userInfo.state1,
        state2: userInfo.state2,
        score: Number(scoreAvg.toFixed(0)) || 0,
        reportCount: userInfo.Report.length,
      };
    }
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    await this.authRepository.updateUser(userId, userName, state1, state2);
  };

  public wishlist = async (userId: number, q: number) => {
    const posts = await this.authRepository.wishlist(userId, q);
    const results = posts.map((v: any) => {
      return {
        postId: v.postId,
        userId: v.post.userId,
        userName: v.post.user.userName,
        userImage: v.post.user.userImage.includes('http://')
          ? v.post.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.post.user.userImage}`,
        title: v.post.title,
        content: v.post.content,
        category: v.post.category,
        appointed: v.post.appointed,
        isDeadLine: v.post.isDeadLine,
        location1: v.post.location1,
        location2: v.post.location2,
        imageUrls: v.post.PostImages.map((val: any) => {
          return `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
        }).length
          ? v.post.PostImages.map((val: any) => {
              return `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
            })
          : randomImg[rand],
        tag: v.post.tag,
        createdAt: v.post.createdAt,
        updated: v.post.updated,
      };
    });
    return results;
  };

  public updateImage = async (userId: number, userImage: string) => {
    const user = await this.authRepository.userInfo(userId);
    if (!user) {
      if (!userImage.includes('/')) deleteS3Image(userImage);
      throw badRequest('해당 유저 없음');
    }
    await this.authRepository.updateImage(userId, userImage);
    if (!user.userImage.includes('/')) deleteS3Image(user.userImage);
  };

  public deleteImage = async (userId: number) => {
    const user = await this.authRepository.userInfo(userId);
    if (!user) throw badRequest('해당 유저 없음');

    const date = new Date();
    const seed = Number(date) % 20;

    const result = await this.authRepository.updateImage(userId, `random/${seed}.png`);

    if (!user.userImage.includes('/')) deleteS3Image(user.userImage);
    return `${S3_BUCKET_URL}/profile/${result.userImage}`;
  };

  public changePassword = async (userId: number, newPw: string, oldPw: string) => {
    const isUser = await this.authRepository.searchPassword(userId);
    if (!isUser) throw badRequest('해당 유저 없음');
    if (!isUser.password) throw badRequest('로컬 회원 아님');

    const match = await bcrypt.compare(oldPw, isUser.password);

    if (match) {
      const hash = await bcrypt.hash(newPw, Number(salt));
      await this.authRepository.updatePassword(userId, hash);
    } else throw badRequest('요구사항에 맞지 않는 입력값');
  };

  public deleteUser = async (userId: number) => {
    const userInfo = await this.authRepository.deleteUser(userId);

    if (!userInfo.userImage.includes('/')) deleteS3Image(userInfo.userImage);
  };

  public score = async (userId: number, score: number) => {
    const scoreRate = await this.authRepository.score(userId, score);
    return scoreRate;
  };

  public myPosts = async (userId: number, q: number) => {
    const myPosts = await this.authRepository.myPosts(userId, q);
    const result = myPosts.map((v: any) => {
      return {
        postId: v.postId,
        userId: v.userId,
        userName: v.userName,
        userImage: v.user.userImage.includes('http://')
          ? v.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.user.userImage}`,
        title: v.title,
        content: v.content,
        category: v.category,
        appointed: v.appointed,
        isDeadLine: v.isDeadLine,
        location1: v.location1,
        location2: v.location2,
        imageUrls: v.PostImages.map((val: any) => {
          return `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
        }).length
          ? v.PostImages.map((val: any) => {
              return `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
            })
          : randomImg[rand],
        tag: v.tag,
        createdAt: v.createdAt,
        updated: v.updated,
      };
    });
    return result;
  };
}

export default AuthService;
