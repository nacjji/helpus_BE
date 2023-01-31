import * as jwt from 'jsonwebtoken';
import { unauthorized, badRequest } from '@hapi/boom';
import prisma from '../config/database/prisma';
import TokenRepository from '../repositories/token.repository';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

class TokenService {
  tokenRepository: TokenRepository;

  constructor() {
    this.tokenRepository = new TokenRepository(prisma);
  }

  public makeNewToken = async (accessToken: string, refreshToken: string) => {
    const result = await this.tokenRepository.checkToken(accessToken, refreshToken);
    if (!result) throw unauthorized('로그인 필요');

    const { expiresIn } = jwt.decode(refreshToken) as { expiresIn: number };

    const leftTime = Number(new Date()) - expiresIn;
    if (leftTime < 1) throw unauthorized('로그인 필요');

    const userInfo = jwt.decode(accessToken) as {
      userId: number;
      userName: string;
      state1: string;
      state2: string;
    };

    const newAccessToken = await jwt.sign(
      {
        userId: userInfo.userId,
        userName: userInfo.userName,
        state1: userInfo.state1,
        state2: userInfo.state2,
      },
      JWT_SECRET_KEY,
      {
        expiresIn: '30m',
      }
    );
    if (leftTime < 86400) {
      const newRefreshToken = await jwt.sign({}, JWT_SECRET_KEY, {
        expiresIn: '14d',
      });

      await this.tokenRepository.updateRefresh(result.tokenId, newAccessToken, newRefreshToken);
      return { newAccessToken, newRefreshToken };
    }
    await this.tokenRepository.updateAccess(result.tokenId, newAccessToken);
    return { newAccessToken };
  };

  public removeToken = async (accessToken: string, refreshToken: string) => {
    await this.tokenRepository.removeToken(accessToken, refreshToken);
  };

  public removeAllTokens = async (accessToken: string, refreshToken: string) => {
    const result = await this.tokenRepository.checkToken(accessToken, refreshToken);
    if (result) {
      const { userId } = jwt.decode(result.accessToken) as { userId: number };
      await this.tokenRepository.removeAllTokens(userId);
    }
  };
}

export default TokenService;
