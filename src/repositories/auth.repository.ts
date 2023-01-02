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
}

export default AuthRepository;
