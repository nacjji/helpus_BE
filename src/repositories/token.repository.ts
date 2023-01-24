import { badRequest } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class TokenRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public checkToken = async (userId: number, accessToken: string, refreshToken: string) => {
    const [result] = await this.prisma.token.findMany({
      where: { userId, accessToken, refreshToken },
    });

    return result;
  };

  public updateAccess = async (tokenId: number, accessToken: string) => {
    await this.prisma.token.update({
      where: { tokenId },
      data: { accessToken },
    });
  };

  public updateRefresh = async (tokenId: number, accessToken: string, refreshToken: string) => {
    await this.prisma.token.update({
      where: { tokenId },
      data: { accessToken, refreshToken },
    });
  };
}

export default TokenRepository;
