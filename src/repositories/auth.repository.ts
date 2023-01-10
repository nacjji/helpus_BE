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
    userImage?: string
  ) => {
    await this.prisma.user.create({
      data: { email, userName, password, state1, state2, userImage },
    });
  };

  public userInfo = async (userId: number) => {
    // const userScore = await this.prisma.score.findMany({ where: { userId } });
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        userName: true,
        email: true,
        userImage: true,
        state1: true,
        state2: true,
        Score: true,
      },
    });

    return user;
  };

  public wishlist = async (userId: number) => {
    interface Wish {
      postId: number;
      userId: number;
      post?: object;
    }

    const results: Wish[] = await this.prisma.wish.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            postId: true,
            userName: true,
            title: true,
            content: true,
            category: true,
            location1: true,
            location2: true,
            imageUrl1: true,
            tag: true,
            createdAt: true,
            updated: true,
          },
        },
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
    await this.prisma.user.update({
      where: { userId },
      data: { userImage },
    });
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
    const myPosts = await this.prisma.post.findMany({ where: { userId } });

    return myPosts;
  };
}

export default AuthRepository;
