import { PrismaClient } from '@prisma/client'; // 그러고보니 모든 레포지토리에 얘 안쓴다 써놨는데 없으면 안되네요; 내부변수의 타입삼네요;;; 삭제하면 안됩니다;;

class WishsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public isWish = async (postId: number, userId: number) => {
    // 찜 되어있는지 확인
    const wishExist = await this.prisma.wish.findMany({ where: { AND: [{ userId }, { postId }] } }); // findFirst로 객체로 받아도 될듯! 물론 스타일 차이입니다
    return wishExist;
  };

  public wishPost = async (postId: number, userId: number) => {
    // 찜 등록
    await this.prisma.wish.create({ data: { postId, userId } });
    return ['찜', postId]; // 밖에서 이 리턴값 안쓰더라고요. 없애도 괜찮을 것 같아요
  };

  public wishDelete = async (postId: number, userId: number) => {
    // 찜 삭제
    await this.prisma.wish.deleteMany({ where: { userId, postId } });
    return ['찜 취소', postId]; // 마찬가지로 사용되지 않습니다.
  };
}

export default WishsRepository;
