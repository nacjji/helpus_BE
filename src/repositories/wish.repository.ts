import { PrismaClient } from '@prisma/client';

class WishsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public isWish = async (postId: number, userId: number) => {
    const wishExist = await this.prisma.wish.findMany({ where: { AND: [{ userId }, { postId }] } });
    return wishExist;
  };

  public wishPost = async (postId: number, userId: number) => {
    await this.prisma.wish.create({ data: { postId, userId } });
    return ['찜', postId];
  };

  public wishDelete = async (postId: number, userId: number) => {
    await this.prisma.wish.deleteMany({ where: { userId, postId } });
    return ['찜 취소', postId];
  };
}

export default WishsRepository;
