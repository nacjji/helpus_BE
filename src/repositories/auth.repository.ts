import { PrismaClient } from '@prisma/client';

class AuthRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public saveToken = async (userId: number, accessToken: string, refreshToken: string) => {
    await this.prisma.token.create({
      data: { userId, accessToken, refreshToken },
    });
  };

  public emailCheck = async (email: string) => {
    const check = await this.prisma.user.findUnique({
      where: { email },
    });

    return check;
  };

  public createUser = async (
    email: string,
    userName: string,
    password: string,
    state1: string,
    state2: string,
    profileImage: string
  ) => {
    const result = await this.prisma.user.create({
      data: { email, userName, password, state1, state2, userImage: profileImage },
    });
    return result;
  };

  public userInfo = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { Report: true },
    });
    return user;
  };

  public wishlist = async (userId: number, q: number) => {
    const results = await this.prisma.wish.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: { select: { userImage: true, userName: true } },
            PostImages: { select: { imageUrl: true } },
          },
        },
      },
      skip: q || 0,
      take: 6,
      orderBy: { postId: 'desc' },
    });
    return results;
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    await this.prisma.user.update({
      where: { userId },
      data: {
        userName,
        state1,
        state2,
      },
    });
  };

  public updateImage = async (userId: number, userImage: string) => {
    const result = await this.prisma.user.update({
      where: { userId },
      data: { userImage },
    });

    return result;
  };

  public searchPassword = async (userId: number) => {
    const password = await this.prisma.user.findUnique({
      where: { userId },
      select: { password: true },
    });

    return password;
  };

  public updatePassword = async (userId: number, password: string) => {
    await this.prisma.user.update({
      where: { userId },
      data: { password },
    });
  };

  public deleteUser = async (userId: number) => {
    const result = await this.prisma.user.delete({
      where: { userId },
    });

    return result;
  };

  public isKakao = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { kakao: true },
    });

    return user;
  };

  public score = async (userId: number, score: number) => {
    const scoreRate = await this.prisma.user.update({
      where: { userId },
      data: { score: { increment: score }, score_total: { increment: 1 } },
    });
    return scoreRate.score / scoreRate.score_total;
  };

  public myPosts = async (userId: number, q: number) => {
    const myPosts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },
      skip: q || 0,
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    return myPosts;
  };
}

export default AuthRepository;
