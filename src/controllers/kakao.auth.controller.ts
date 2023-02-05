import { RequestHandler } from 'express';
import KakaoAuthService from '../services/kakao.auth.service';
import { deleteCookie } from '../modules/token.module';

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
        res.cookie('helpusAccess', result.accessToken, {
          sameSite: 'none',
          secure: true,
          maxAge: 60 * 60 * 24 * 14 * 1000,
        });
        res.cookie('helpusRefresh', result.refreshToken, {
          sameSite: 'none',
          secure: true,
          maxAge: 60 * 60 * 24 * 14 * 1000,
        });
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
        res.cookie('helpusAccess', result.accessToken, {
          sameSite: 'none',
          secure: true,
          maxAge: 60 * 60 * 24 * 14 * 1000,
        });
        res.cookie('helpusRefresh', result.refreshToken, {
          sameSite: 'none',
          secure: true,
          maxAge: 60 * 60 * 24 * 14 * 1000,
        });
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
