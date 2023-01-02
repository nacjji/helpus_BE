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
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public kakaoState: RequestHandler = async (req, res, next) => {
    try {
      const { state1, state2, userId } = req.body;

      const result = await this.kakaoAuthService.kakaoState(state1, state2, userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}

export default KakaoAuthController;
