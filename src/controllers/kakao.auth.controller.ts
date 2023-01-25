import { RequestHandler } from 'express';
import KakaoAuthService from '../services/kakao.auth.service';

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
        res.cookie('helpusAccess', result.accessToken, { sameSite: 'none', secure: true });
        res.cookie('helpusRefresh', result.refreshToken, { sameSite: 'none', secure: true });
      }

      res.status(200).json({
        userId: result.userid,
        userImage: result.userImage,
        userName: result.userName,
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
        res.cookie('helpusAccess', result.accessToken, { sameSite: 'none', secure: true });
        res.cookie('helpusRefresh', result.refreshToken, { sameSite: 'none', secure: true });
      }

      res.status(201).json({
        userId: result.userId,
        userImage: result.userImage,
        userName: result.userName,
      });
    } catch (err) {
      next(err);
    }
  };

  public kakaoDelete: RequestHandler = async (req, res, next) => {
    try {
      await this.kakaoAuthService.kakaoDelete(res.locals.userId);

      res.status(200).json({ message: '탈퇴 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default KakaoAuthController;
