import { RequestHandler } from 'express';
import KakaoAuthService from '../services/kakao.auth.service';
import { deleteCookie, makeCookie } from '../modules/cookie.module';

class KakaoAuthController {
  kakaoAuthService: KakaoAuthService;

  constructor() {
    this.kakaoAuthService = new KakaoAuthService();
  }

  public kakao: RequestHandler = async (req, res, next) => {
    try {
      const { code } = req.query as { code: string };

      const result = await this.kakaoAuthService.kakao(code);
      if (result.accessToken) {
        res.locals.access = result.accessToken;
        res.locals.refresh = result.refreshToken;

        makeCookie(req, res, next);
      }

      res.status(200).json({
        userId: result.userid,
        userImage: result.userImage,
        userName: result.userName,
        state1: result.state1,
        state2: result.state2,
      });
    } catch (err) {
      next(err);
    }
  };

  public kakaoState: RequestHandler = async (req, res, next) => {
    try {
      const { state1, state2, userId } = req.body;

      const result = await this.kakaoAuthService.kakaoState(state1, state2, userId);
      if (result.accessToken) {
        res.locals.access = result.accessToken;
        res.locals.refresh = result.refreshToken;

        makeCookie(req, res, next);
      }

      res.status(201).json({
        userId: result.userId,
        userImage: result.userImage,
        userName: result.userName,
        state1: result.state1,
        state2: result.state2,
      });
    } catch (err) {
      next(err);
    }
  };

  public kakaoDelete: RequestHandler = async (req, res, next) => {
    try {
      await this.kakaoAuthService.kakaoDelete(res.locals.userId);
      deleteCookie(req, res, next);

      res.status(200).json({ message: '탈퇴 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default KakaoAuthController;
