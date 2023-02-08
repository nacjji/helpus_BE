import { RequestHandler } from 'express';
import TokenService from '../services/token.service';
import { deleteCookie, makeCookie } from '../modules/cookie.module';

class TokenController {
  tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  public newToken: RequestHandler = async (req, res, next) => {
    // 새 토큰 발급 함수
    try {
      const { helpusAccess, helpusRefresh } = req.cookies; // 기존에 있던 쿠키 받아옴

      const { newAccessToken, newRefreshToken } = await this.tokenService.makeNewToken(
        // 기존토큰들 넘겨주고 새 토큰 생ㅇ성
        helpusAccess,
        helpusRefresh
      );

      res.locals.access = newAccessToken; // locals에 새 액세스 토큰 저장
      if (newRefreshToken) res.locals.refresh = newRefreshToken; // 리프레시 토큰이 있는 경우에만 locals에 리프레시 저장
      makeCookie(req, res, next); // 쿠키 생성 모듈 호출

      res.status(200).json({ message: '토큰 발급 완료' });
    } catch (err) {
      next(err);
    }
  };

  public removeToken: RequestHandler = async (req, res, next) => {
    // 해당 브라우저의 토큰 삭제 함수
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      // 토큰이 정상이면 -> 요청대로 삭제하면 됨
      // 토큰이 비정상이면 -> 접근 방식이나 사용자가 올바르지 않음. 삭제하면 됨
      await this.tokenService.removeToken(helpusAccess, helpusRefresh); // 따라서 결국 일단 냅다 지우면 됨
      deleteCookie(req, res, next); // 그리고 쿠키 삭제 모듈도 호출
      res.status(200).json({ helpusAccess, helpusRefresh });
    } catch (err) {
      next(err);
    }
  };

  public removeAllToken: RequestHandler = async (req, res, next) => {
    // 요청보낸 유저의 모든 브라우저에 쌓은 쿠키 삭제
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      await this.tokenService.removeAllTokens(helpusAccess, helpusRefresh); // removeToken과 같은 맥락. 그냥 지워도 됨
      deleteCookie(req, res, next); // 쿠키 삭제 모듈 호출
      res.status(200).json({ message: '전체 토큰 삭제 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default TokenController;
