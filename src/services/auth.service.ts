import { badRequest } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import AuthRepository from '../repositories/auth.repository';
import randomImage from '../modules/randomImage.module';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };
const { salt } = process.env as { salt: string };

class AuthService {
  authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  // eslint-disable-next-line class-methods-use-this
  public test = async (userId: number) => {
    await console.log(randomImage(userId));
  };

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

    const hash = await bcrypt.hash(password, Number(salt));
    const result = await this.authRepository.createUser(
      email,
      userName,
      hash,
      state1,
      state2,
      profileImage
    );
    return result;
  };

  public localLogin = async (email: string, password: string) => {
    const user = await this.authRepository.emailCheck(email);
    if (!user) throw badRequest('이메일/비밀번호 불일치');
    if (!user.password) throw badRequest('로컬 회원 아님');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw badRequest('이메일/비밀번호 불일치');

    const token = await jwt.sign(
      { userId: user.userId, userName: user.userName, state1: user.state1, state2: user.state2 },
      JWT_SECRET_KEY,
      {
        expiresIn: '2h',
      }
    );

    return {
      userId: user.userId,
      userName: user.userName,
      userImage: `${process.env.S3_BUCKET_URL}/profile/${user.userImage}`,
      token,
    };
  };

  public detailUser = async (userId: number) => {
    const userInfo = await this.authRepository.userInfo(userId);

    if (!userInfo) throw badRequest('요구사항에 맞지 않는 입력값');
    else {
      let imageUrl = userInfo.userImage;
      if (!userInfo.userImage) imageUrl = null;
      else if (!userInfo.kakao)
        imageUrl = `${process.env.S3_BUCKET_URL}/profile/${userInfo?.userImage}`;

      const scoreAvg =
        // eslint-disable-next-line no-unsafe-optional-chaining
        userInfo.Score?.reduce((sum: number, curValue) => {
          return sum + curValue.score;
        }, 0) / userInfo.Score.length;

      return {
        userId: userInfo.userId,
        userName: userInfo.userName,
        userImage: imageUrl,
        email: userInfo.email,
        state1: userInfo.state1,
        state2: userInfo.state2,
        score: Number(scoreAvg.toFixed(1)),
      };
    }
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    await this.authRepository.updateUser(userId, userName, state1, state2);
  };

  public wishlist = async (userId: number) => {
    const posts = await this.authRepository.wishlist(userId);

    const results = posts.map((v) => v.post);
    return results;
  };

  public updateImage = async (userId: number, userImage: string) => {
    const user = await this.authRepository.userInfo(userId);
    if (!user) throw badRequest('해당 유저 없음');
    await this.authRepository.updateImage(userId, userImage);
    return user.userImage;
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
    await this.authRepository.deleteUser(userId);
  };

  public score = async (userId: number, score: number) => {
    const scoreRate = await this.authRepository.score(userId, score);
    return scoreRate;
  };

  public myPosts = async (userId: number) => {
    const myPosts = await this.authRepository.myPosts(userId);
    return myPosts;
  };
}

export default AuthService;
