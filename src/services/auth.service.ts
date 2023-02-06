import { badRequest, notFound } from '@hapi/boom';
import bcrypt from 'bcrypt';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';
import { deleteS3Image } from '../middlewares/multer.uploader';
import { makeAccessToken, makeRefreshToken } from '../modules/token.module';

const { salt } = process.env as { salt: string };
const { S3_BUCKET_URL } = process.env as { S3_BUCKET_URL: string };

class AuthService {
  authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository(prisma);
  }

  public emailCheck = async (email: string) => {
    const check = await this.authRepository.emailCheck(email);

    if (check) throw badRequest('중복된 이메일');

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

    if (!user.state1 || !user.state2) throw badRequest('주소값 없는 사용자');

    const accessToken = await makeAccessToken(user.userId, user.userName, user.state1, user.state2);
    const refreshToken = await makeRefreshToken();

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
      const imageUrl = userInfo.userImage.includes('kakaocdn')
        ? userInfo.userImage
        : `${process.env.S3_BUCKET_URL}/profile/${userInfo?.userImage}`;

      return {
        userId: userInfo.userId,
        userName: userInfo.userName,
        userImage: imageUrl,
        email: userInfo.email,
        state1: userInfo.state1,
        state2: userInfo.state2,
        score: Math.trunc(userInfo.score / userInfo.score_total),
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
        thumbnail:
          v.post.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? v.post.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${v.post.PostImages[0].imageUrl}`,
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
    const findUser = await this.authRepository.userInfo(userId);
    if (!findUser) throw notFound('잘못된 유저 정보이거나 탈퇴한 유저입니다.');
    await this.authRepository.score(userId, score);
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
        thumbnail:
          v.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? v.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${v.PostImages[0].imageUrl}`,
        tag: v.tag,
        createdAt: v.createdAt,
        updated: v.updated,
      };
    });
    return result;
  };
}

export default AuthService;
