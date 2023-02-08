import { RequestHandler } from 'express';
import KakaoAuthService from '../services/kakao.auth.service';
import { deleteCookie, makeCookie } from '../modules/cookie.module';

class KakaoAuthController {
  kakaoAuthService: KakaoAuthService;

  constructor() {
    this.kakaoAuthService = new KakaoAuthService();
  }

  public kakao: RequestHandler = async (req, res, next) => {
    // 카카오 로그인 시도 함수
    try {
      const { code } = req.query as { code: string }; // 카카오 인가코드

      const result = await this.kakaoAuthService.kakao(code); // 인가코드로 유저 로그인 시도
      if (result.accessToken) {
        // 정상적으로 등록된 유저인 경우
        res.locals.access = result.accessToken; // 토큰을 locals에 저장하고
        res.locals.refresh = result.refreshToken;

        makeCookie(req, res, next); // 쿠키 발급 모듈 활용
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
    // 카카오 유저 지역 등록 함수
    try {
      const { state1, state2, userId } = req.body;

      const result = await this.kakaoAuthService.kakaoState(state1, state2, userId); // 지역이 정상적으로 등록 되면
      if (result.accessToken) {
        // 토큰이 발급되고
        res.locals.access = result.accessToken; // locals에 저장해서
        res.locals.refresh = result.refreshToken;

        makeCookie(req, res, next); // 쿠키 발급
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
    // 카카오 회원 탈퇴
    try {
      await this.kakaoAuthService.kakaoDelete(res.locals.userId); // 요청자 유저아이디 전달
      deleteCookie(req, res, next); // 남아있을 쿠키 삭제

      res.status(200).json({ message: '탈퇴 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default KakaoAuthController;
