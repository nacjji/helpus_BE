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
    state: string,
    profileImage: string
  ) => {
    const check = await this.authRepository.emailCheck(email);
    if (check) throw badRequest('사용 중인 이메일');

    const hash = await bcrypt.hash(password, Number(salt));
    await this.authRepository.createUser(email, userName, hash, state);
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
}

export default AuthService;
