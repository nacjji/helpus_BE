import { badRequest } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import AuthRepository from '../repositories/auth.repository';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };
const { salt } = process.env as { salt: string };

class AuthService {
  authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
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

    const hash = await bcrypt.hash(password, Number(salt));
    await this.authRepository.createUser(email, userName, hash, state1, state2, profileImage);
  };

  public localLogin = async (email: string, password: string) => {
    const user = await this.authRepository.emailCheck(email);
    if (!user) throw badRequest('이메일/비밀번호 불일치');
    if (!user.password) throw badRequest('로컬 회원 아님');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw badRequest('이메일/비밀번호 불일치');

    const token = await jwt.sign({ userId: user.userId, userName: user.userName }, JWT_SECRET_KEY, {
      expiresIn: '2h',
    });

    return {
      userId: user.userId,
      userName: user.userName,
      userImage: user.userImage,
      token,
    };
  };

  public detailUser = async (userId: number) => {
    const userInfo = await this.authRepository.userInfo(userId);
    const imageUrl = `${process.env.S3_BUCKET_URL}/profile/${userInfo?.userImage}`;

    if (!userInfo) throw badRequest('요구사항에 맞지 않는 입력값');

    return {
      userId: userInfo.userId,
      userName: userInfo.userName,
      userImage: imageUrl,
      email: userInfo.email,
      state1: userInfo.state1,
      state2: userInfo.state2,
    };
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    await this.authRepository.updateUser(userId, userName, state1, state2);
  };

  public wishlist = async (userId: number) => {
    const posts = await this.authRepository.wishlist(userId);

    console.log(posts);
    const results = posts.map((v) => v.post);

    return results;
  };
}

export default AuthService;
