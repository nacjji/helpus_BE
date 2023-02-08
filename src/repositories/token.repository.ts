// TODO: 여기 임포트 둘다 삭제해야함. 노쓸모
import { badRequest } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class TokenRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public checkToken = async (accessToken: string, refreshToken: string) => {
    // 토큰쌍 맞는지 확인
    const [result] = await this.prisma.token.findMany({
      // findFirst로 바꿔도 될듯
      where: { accessToken, refreshToken },
    });

    return result;
  };

  public updateAccess = async (tokenId: number, accessToken: string) => {
    // 액세스 토큰 업데이트
    await this.prisma.token.update({
      where: { tokenId },
      data: { accessToken },
    });
  };

  public updateRefresh = async (tokenId: number, accessToken: string, refreshToken: string) => {
    // 리프레시 토큰, 액세스토큰 모두 업데이트
    await this.prisma.token.update({
      where: { tokenId },
      data: { accessToken, refreshToken },
    });
  };

  public removeToken = async (accessToken: string, refreshToken: string) => {
    // 토큰 한쌍 삭제
    await this.prisma.token.deleteMany({
      where: { accessToken, refreshToken },
    });
  };

  public removeAllTokens = async (userId: number) => {
    // userId에 해당하는 모든 토큰쌍 삭제
    await this.prisma.token.deleteMany({
      where: { userId },
    });
  };
}

export default TokenRepository;
