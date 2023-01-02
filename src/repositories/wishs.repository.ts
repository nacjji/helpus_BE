import { notFound } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class WishsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public wishPost = async (postId: number, userId: number) => {
    const wishExist = await this.prisma.wish.findMany({ where: { userId } });
    const isPostExist = await this.prisma.post.findUnique({ where: { postId } });
    if (!isPostExist) {
      throw notFound('게시글 없음');
    }
    if (wishExist.length) {
      const result = await this.prisma.wish.deleteMany({ where: { userId } });
      return '찜 취소';
    }
    const result = await this.prisma.wish.create({ data: { postId, userId } });
    return '찜';
  };
}

export default WishsRepository;
