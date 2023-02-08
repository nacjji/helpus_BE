import { PrismaClient } from '@prisma/client';

class WishsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  // 찜 여부 확인
  public isWish = async (postId: number, userId: number) => {
    // wish 테이블에서 게시글의 찜 여부확인
    const wishExist = await this.prisma.wish.findMany({ where: { AND: [{ userId }, { postId }] } });
    return wishExist;
  };

  // wish.service 에서 받아온 값을 생성만 시켜줌
  public wishPost = async (postId: number, userId: number) => {
    await this.prisma.wish.create({ data: { postId, userId } });
    return ['찜', postId];
  };

  // wish.service 에서 받아와서 삭제만 시켜줌
  public wishDelete = async (postId: number, userId: number) => {
    await this.prisma.wish.deleteMany({ where: { userId, postId } });
    return ['찜 취소', postId];
  };
}

export default WishsRepository;
