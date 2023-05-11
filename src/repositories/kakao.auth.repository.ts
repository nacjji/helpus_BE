import { PrismaClient } from '@prisma/client';

class KakaoAuthRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public checkIsUser = async (kakao: number) => {
    const user = await this.prisma.user.findUnique({
      where: { kakao },
    });

    return user;
  };

  public registerUser = async (kakao: number, userName: string, userImage: string) => {
    const user = await this.prisma.user.create({
      data: {
        kakao,
        userName,
        userImage,
      },
    });

    return user;
  };

  public kakaoState = async (state1: string, state2: string, userId: number) => {
    const user = await this.prisma.user.update({
      where: { userId },
      data: { state1, state2 },
    });

    return user;
  };

  public findKakaoId = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    return user;
  };

  public kakaeDelete = async (userId: number) => {
    await this.prisma.user.delete({
      where: { userId },
    });
  };

  public saveToken = async (userId: number, accessToken: string, refreshToken: string) => {
    await this.prisma.token.create({
      data: { userId, accessToken, refreshToken },
    });
  };
}

export default KakaoAuthRepository;
