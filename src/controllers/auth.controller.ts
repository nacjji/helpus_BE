import { RequestHandler } from 'express';
import AuthService from '../services/auth.service';
import { emailPattern, signupPattern, loginPattenrn } from '../validations/auth.validations';
import { deleteS3Image } from '../middlewares/multer.uploader';

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
    const { location: userImage } = req.file as Express.MulterS3.File;
    const fileUrl = userImage.split('/');

    try {
      const { email, password, userName, state1, state2 } = await signupPattern.validateAsync(
        req.body
      );

      await this.authService.localSignup(
        email,
        password,
        userName,
        state1,
        state2,
        fileUrl[fileUrl.length - 1]
      );

      res.status(201).json({ message: '가입 완료' });
    } catch (err) {
      if (userImage) deleteS3Image(fileUrl[fileUrl.length - 1]);
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

  public detailUser: RequestHandler = async (req, res, next) => {
    try {
      const userInfo = await this.authService.detailUser(res.locals.userId);

      res.status(200).json(userInfo);
    } catch (err) {
      next(err);
    }
  };

  public wishlist: RequestHandler = async (req, res, next) => {
    try {
      const results = await this.authService.wishlist(res.locals.userId);

      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };
}

export default AuthController;
