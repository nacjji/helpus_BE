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
    state: string,
    userImage?: string
  ) => {
    await this.prisma.user.create({
      data: { email, userName, password, state, userImage },
    });
  };
}

export default AuthRepository;
