import { RequestHandler } from 'express';
import AuthService from '../services/auth.service';
import { emailPattern, signupPattern, loginPattenrn } from '../validations/auth.validations';

class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public emailCheck: RequestHandler = async (req, res, next) => {
    try {
      const { email } = await emailPattern.validateAsync(req.body);
      const check = await this.authService.emailCheck(email);

      if (check) res.status(400).json({ errorMessage: '중복된 이메일' });
      else res.status(200).json({ message: '사용 가능' });
    } catch (err) {
      next(err);
    }
  };

  public localSignup: RequestHandler = async (req, res, next) => {
    try {
      const { email, password, userName, state, profileImage } = await signupPattern.validateAsync(
        req.body
      );
      await this.authService.localSignup(email, password, userName, state, profileImage);
      res.status(201).json({ message: '가입 완료' });
    } catch (err) {
      next(err);
    }
  };

  public localLogin: RequestHandler = async (req, res, next) => {
    try {
      const { email, password } = await loginPattenrn.validateAsync(req.body);
      const result = await this.authService.localLogin(email, password);

      res.status(200).json({
        userId: result.userId,
        userName: result.userName,
        userImage: result.userImage,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default AuthController;
