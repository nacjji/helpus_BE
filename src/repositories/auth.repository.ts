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
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        userName: true,
        email: true,
        userImage: true,
        state1: true,
        state2: true,
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
}

export default AuthRepository;
