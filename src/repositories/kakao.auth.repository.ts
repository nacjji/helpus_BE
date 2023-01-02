import { PrismaClient } from '@prisma/client';

class KakaoAuthRepository {
  prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
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
}

export default KakaoAuthRepository;
