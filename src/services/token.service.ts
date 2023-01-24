import jwtDecode from 'jwt-decode';
import * as jwt from 'jsonwebtoken';
import { unauthorized } from '@hapi/boom';
import prisma from '../config/database/prisma';
import TokenRepository from '../repositories/token.repository';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

class TokenService {
  tokenRepository: TokenRepository;

  constructor() {
    this.tokenRepository = new TokenRepository(prisma);
  }

  public makeNewToken = async (accessToken: string, refreshToken: string) => {
    if (!accessToken || !refreshToken) throw unauthorized('비정상 토큰으로 확인됨');

    const payload: any = jwtDecode(accessToken);
    if (!payload) throw unauthorized('올바르지 않은 토큰');

    const { expiresIn } = jwtDecode(refreshToken) as { expiresIn: number };
    const result = await this.tokenRepository.checkToken(payload.userId, accessToken, refreshToken);
    if (!result) throw unauthorized('로그인 필요');

    const newAccessToken = await jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: '30m',
    });
    const expired = Number(new Date()) - expiresIn;
    if (expired < 86400) {
      const newRefreshToken = await jwt.sign({}, JWT_SECRET_KEY, {
        expiresIn: '14d',
      });

      await this.tokenRepository.updateRefresh(result.tokenId, newAccessToken, newRefreshToken);
      return { newAccessToken, newRefreshToken };
    }
    await this.tokenRepository.updateAccess(result.tokenId, newAccessToken);
    return { newAccessToken };
  };
}

export default TokenService;
