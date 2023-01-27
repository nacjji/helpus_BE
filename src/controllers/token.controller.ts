import { badRequest } from '@hapi/boom';
import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import TokenService from '../services/token.service';
import prisma from '../config/database/prisma';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

class TokenController {
  tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  public newToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh, expiresIn, userId } = req.cookies;
      if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');

      const { newAccessToken, newRefreshToken } = await this.tokenService.makeNewToken(
        helpusAccess,
        helpusRefresh
      );

      res.cookie('helpusAccess', newAccessToken, { sameSite: 'none', secure: true });
      if (newRefreshToken)
        res.cookie('helpusRefresh', newRefreshToken, { sameSite: 'none', secure: true });

      res.status(200).json({ message: '토큰 발급 완료', expiresIn, userId });
    } catch (err) {
      res.cookie('helpusAccess', '', { sameSite: 'none', secure: true });
      res.cookie('helpusRefresh', '', { sameSite: 'none', secure: true });
      next(err);
    }
  };

  public removeToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      res.cookie('helpusAccess', '', { sameSite: 'none', secure: true });
      res.cookie('helpusRefresh', '', { sameSite: 'none', secure: true });

      if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');

      await this.tokenService.removeToken(helpusAccess, helpusRefresh);
      res.status(200).json({ helpusAccess, helpusRefresh });
    } catch (err) {
      next(err);
    }
  };

  public removeAllToken: RequestHandler = async (req, res, next) => {
    try {
      const { helpusAccess, helpusRefresh } = req.cookies;

      res.cookie('helpusAccess', '', { sameSite: 'none', secure: true });
      res.cookie('helpusRefresh', '', { sameSite: 'none', secure: true });

      if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');

      await this.tokenService.removeAllTokens(helpusAccess, helpusRefresh);
      res.status(200).json({ message: '전체 토큰 삭제 완료' });
    } catch (err) {
      next(err);
    }
  };
}

export default TokenController;
