import { RequestHandler } from 'express';
import AuthService from '../services/auth.service';
import {
  emailPattern,
  signupPattern,
  loginPattenrn,
  updatePattern,
  scorePattern,
} from '../validations/auth.validations';
import { makeCookie, deleteCookie } from '../modules/cookie.module';

class AuthController {
  authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // eslint-disable-next-line class-methods-use-this
  public test: RequestHandler = (req, res, next) => {
    res.status(200).json({ message: '깃허브 액션 테스트 2' });
  };

  public emailCheck: RequestHandler = async (req, res, next) => {
    try {
      const { email } = await emailPattern.validateAsync(req.body);
      await this.authService.emailCheck(email);

      res.status(200).json({ message: '사용 가능' });
    } catch (err) {
      next(err);
    }
  };

  public localSignup: RequestHandler = async (req, res, next) => {
    try {
      const { email, password, userName, state1, state2 } = await signupPattern.validateAsync(
        req.body
      );

      let fileUrl = '';
      if (req.file) {
        const { location: userImage } = req.file as Express.MulterS3.File;
        fileUrl = userImage.split('/')[userImage.split('/').length - 1];
      }

      await this.authService.localSignup(email, password, userName, state1, state2, fileUrl);
      res.status(201).json({ message: '가입 완료' });
    } catch (err) {
      next(err);
    }
  };

  public localLogin: RequestHandler = async (req, res, next) => {
    try {
      const { email, password } = await loginPattenrn.validateAsync(req.body);
      const result = await this.authService.localLogin(email, password);

      res.locals.access = result.accessToken;
      res.locals.refresh = result.refreshToken;

      makeCookie(req, res, next);

      res.status(200).json({
        userId: result.userId,
        userName: result.userName,
        userImage: result.userImage,
        state1: result.state1,
        state2: result.state2,
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

  public updateUser: RequestHandler = async (req, res, next) => {
    try {
      const { userName, state1, state2 } = await updatePattern.validateAsync(req.body);
      const { userId } = res.locals;

      await this.authService.updateUser(userId, userName, state1, state2);

      res.status(200).json({ userName, state1, state2 });
    } catch (err) {
      next(err);
    }
  };

  public updateImage: RequestHandler = async (req, res, next) => {
    const { location: userImage } = req.file as Express.MulterS3.File;
    const fileUrl = userImage.split('/');

    try {
      const { userId } = res.locals;
      await this.authService.updateImage(userId, fileUrl[fileUrl.length - 1]);

      res.status(200).json({ userImage });
    } catch (err) {
      next(err);
    }
  };

  public deleteImage: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const userImage = await this.authService.deleteImage(userId);

      res.status(200).json({ userImage });
    } catch (err) {
      next(err);
    }
  };

  public wishlist: RequestHandler = async (req, res, next) => {
    try {
      const { page } = req.query;
      const results = await this.authService.wishlist(res.locals.userId, Number(page));
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  public changePassword: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const { newPw, password } = req.body;

      await this.authService.changePassword(userId, newPw, password);
      res.status(200).json({ message: '비밀번호 변경 성공' });
    } catch (err) {
      next(err);
    }
  };

  public getUserDetail: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const result = await this.authService.detailUser(Number(userId));
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public deleteUser: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      await this.authService.deleteUser(userId);

      deleteCookie(req, res, next);

      res.status(200).json({ message: '탈퇴 완료', userId });
      next();
    } catch (err) {
      next(err);
    }
  };

  public score: RequestHandler = async (req, res, next) => {
    try {
      const { score, userId } = req.body;
      await this.authService.score(userId, score);
      await scorePattern.validateAsync(req.body);
      return res.status(201).json({ message: `userId ${userId} 에게 평점 완료` });
    } catch (err) {
      return next(err);
    }
  };

  public myPosts: RequestHandler = async (req, res, next) => {
    try {
      const { page } = req.query;
      const { userId } = res.locals;
      const results = await this.authService.myPosts(userId, Number(page));
      return res.status(200).json({ results });
    } catch (err) {
      return next(err);
    }
  };
}

export default AuthController;
