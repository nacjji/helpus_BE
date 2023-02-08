import jwt from 'jsonwebtoken'; // 토큰을 다루기 위한 라이브러리
import { unauthorized, badRequest } from '@hapi/boom';
import prisma from '../config/database/prisma';
import TokenRepository from '../repositories/token.repository';
import { makeAccessToken, makeRefreshToken } from '../modules/token.module';

class TokenService {
  tokenRepository: TokenRepository;

  constructor() {
    this.tokenRepository = new TokenRepository(prisma);
  }

  public makeNewToken = async (accessToken: string, refreshToken: string) => {
    // 새 토큰 생성 로직
    if (!accessToken || !refreshToken) throw badRequest('비정상 토큰으로 확인됨'); // 둘 중 하나라도 없으면 에러

    const result = await this.tokenRepository.checkToken(accessToken, refreshToken); // 두 토큰이 짝꿍인지 확인
    if (!result) throw unauthorized('로그인 필요'); // 그런 쌍 없으면 에러

    const { expiresIn } = jwt.decode(refreshToken) as { expiresIn: number }; // 리프레시 토큰 디코드해서 만료시간 가져옴

    const leftTime = Number(new Date()) - expiresIn; // 만약에 만료시간이 1보다 작으면 이미 만료된 토큰임
    if (leftTime < 1) throw unauthorized('로그인 필요'); // 그래서 에러 던짐

    const userInfo = jwt.decode(accessToken) as {
      // 위에 다 통과하고 나오면 기존 액세스 토큰 까서 내용물 가져옴
      userId: number;
      userName: string;
      state1: string;
      state2: string;
    };

    const newAccessToken = await makeAccessToken(
      // 새 토큰을
      userInfo.userId, // 위에서 방금깐 내용물 가지고 만들어줌
      userInfo.userName,
      userInfo.state1,
      userInfo.state2
    );
    if (leftTime < 86400) {
      // 정상이긴 했지만, 리프레시 토큰 만료일이 24시간이 채 안 남았다면
      const newRefreshToken = await makeRefreshToken(); // 리프레시 토큰도 새로 발급함. 2주 안에 한번만 들어오면 무한 자동로그인 가능

      await this.tokenRepository.updateRefresh(result.tokenId, newAccessToken, newRefreshToken); // 새로 발급한 토큰쌍들로 db 업데이트
      return { newAccessToken, newRefreshToken }; // 액세스, 리프레시 모두 넘겨줌
    }
    await this.tokenRepository.updateAccess(result.tokenId, newAccessToken); // 리프레시는 두고 액세스만 업데이트
    return { newAccessToken }; // 액세스만 넘겨줌
  };

  public removeToken = async (accessToken: string, refreshToken: string) => {
    // 요청온 토큰만 삭제하는 로직
    if (!accessToken || !refreshToken) throw badRequest('비정상 토큰으로 확인됨'); // 하나라도 없으면 큰일남

    await this.tokenRepository.removeToken(accessToken, refreshToken); // 토큰쌍 찾아서 삭제
  };

  public removeAllTokens = async (accessToken: string, refreshToken: string) => {
    // 유저의 모든 토큰 삭제하는 로직
    if (!accessToken || !refreshToken) throw badRequest('비정상 토큰으로 확인됨'); // 하나라도~ 큰일~

    const result = await this.tokenRepository.checkToken(accessToken, refreshToken); // 이 토큰쌍이 있는지 일단 찾아보고
    if (result) {
      // 결과 있을때만
      const { userId } = jwt.decode(result.accessToken) as { userId: number }; // 토큰 까서 안에 userId 꺼내오고
      await this.tokenRepository.removeAllTokens(userId); // 그 아이디에 해당하는 모든 토큰쌍 삭제
    }
  };
}

export default TokenService;
