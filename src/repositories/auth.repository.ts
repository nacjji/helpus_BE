import { badRequest } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class AuthRepository {
  prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

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
      include: { Report: true, Score: true },
    });
    return user;
  };

  public wishlist = async (userId: number) => {
    const results = await this.prisma.wish.findMany({
      where: { userId },
      include: {
        post: { include: { user: { select: { userImage: true, userName: true } } } },
      },
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
    await this.prisma.user.delete({
      where: { userId },
    });
  };

  public isKakao = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { kakao: true },
    });

    return user;
  };

  public score = async (userId: number, score: number) => {
    const allScores = await this.prisma.score.findMany();
    const isExistUser = await this.prisma.user.findUnique({ where: { userId } });
    if (!isExistUser) throw badRequest('존재하지 않는 사용자');
    const scoreRate = await this.prisma.score.create({ data: { userId, score } });
    return [scoreRate, ...allScores];
  };

  // eslint-disable-next-line class-methods-use-this
  public myPosts = async (userId: number) => {
    const myPosts = await this.prisma.post.findMany({
      where: { userId },
      include: { user: { select: { userImage: true } } },
    });

    return myPosts;
  };
}

export default AuthRepository;
