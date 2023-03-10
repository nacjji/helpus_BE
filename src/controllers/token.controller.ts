import { RequestHandler } from 'express';
import TokenService from '../services/token.service';
import { deleteCookie, makeCookie } from '../modules/cookie.module';

class TokenController {
  tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  public newToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      const { newAccessToken, newRefreshToken } = await this.tokenService.makeNewToken(
        helpusAccess,
        helpusRefresh
      );

      res.locals.access = newAccessToken;
      if (newRefreshToken) res.locals.refresh = newRefreshToken;
      makeCookie(req, res, next);

      res.status(200).json({ message: '토큰 발급 완료' });
    } catch (err) {
      next(err);
    }
  };

  public removeToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      await this.tokenService.removeToken(helpusAccess, helpusRefresh);
      deleteCookie(req, res, next);
      res.status(200).json({ helpusAccess, helpusRefresh });
    } catch (err) {
      next(err);
    }
  };

  public removeAllToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      await this.tokenService.removeAllTokens(helpusAccess, helpusRefresh);
      deleteCookie(req, res, next);
      res.status(200).json({ message: '전체 토큰 삭제 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default TokenController;
