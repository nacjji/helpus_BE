// TODO: 사용하지 않는 import
import { PrismaClient } from '@prisma/client';

class PostsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public createPost = async (
    // 글 생성
    userId: number,
    userName: string,
    title: string,
    content: string,
    category: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    tag?: string,
    createdAt?: Date
  ) => {
    const result = await this.prisma.post.create({
      data: {
        userId,
        userName,
        title,
        content,
        category,
        appointed,
        location1,
        location2,
        tag,
        createdAt,
      },
    });
    return result;
  };

  public uploadPostImages = async (imageArr: any) => {
    // 이미지 등록
    // 서비스 단 보니까 userId, postId가 동일한데 모든 객체에 다 있더라구요! 파일명만 배열로 할 수 있는 방법은 없나요? 궁금증입니다.
    await this.prisma.postImages.createMany({
      data: imageArr,
    });
  };

  public myLocationPosts = async (
    // 위치 기반 글목록
    page: number,
    state1?: string, // 위치기반인데 state가 undefined이어도 되는지?
    state2?: string,
    category?: number,
    search?: string
  ) => {
    const result = await this.prisma.post.findMany({
      where: {
        AND: [{ location1: state1 }, { location2: state2 }, { category: category || undefined }],
        OR: [
          { title: { contains: search || '' } }, // search가 undefined일수 있는데, null이면 에러가 나나요? 굳이 공백문자열을 둬야하나 의문이라서요!
          { content: { contains: search || '' } },
          { userName: { contains: search || '' } },
          { location1: { contains: search || '' } },
          { location2: { contains: search || '' } },
          { tag: { contains: search || '' } },
        ],
      },
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },

      skip: page || 0,
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    return result;
  };

  public allLocationPosts = async (page: number, category: number, search?: string) => {
    // 전체 지역 글 조회
    const result = await this.prisma.post.findMany({
      where: {
        category: category || undefined, // 카테고리는 위에서 number로 무조건 받아오는데, undefined로 설정될 일이 있는지 궁금합니다.
        OR: [
          { title: { contains: search || '' } }, // 위와 같은 의견!
          { content: { contains: search || '' } },
          { userName: { contains: search || '' } },
          { location1: { contains: search || '' } },
          { location2: { contains: search || '' } },
          { tag: { contains: search || '' } },
        ],
      },
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },
      skip: page || 0,
      take: 12,
      orderBy: { createdAt: 'desc' },
    });
    return result;
  };

  public findDetailPost = async (postId: number) => {
    // 특정 글 조회
    const result = await this.prisma.post.findUnique({
      where: { postId },
      include: {
        _count: {
          // 스키마에는 없던데, _count 이게 프리즈마 약속 변수인가요? 아님 지원님이 지정한 이름인가요?
          select: { Wish: true },
        },
        user: { select: { userImage: true, score: true, score_total: true } }, // 작성자 이미지, 점수 등 정보도 함꼐 선택
        PostImages: { select: { imageUrl: true } }, // 등록된 이미지도 함께 가져옴
      },
    });
    return result;
  };

  public isWished = async (userId: number, postId: number) => {
    // 찜했었는지 확인
    const result = await this.prisma.wish.findFirst({ where: { AND: [{ userId }, { postId }] } }); // 유저아이디, 포스트아이디로 검색해보고
    if (result) return 1; // 결과에 따라 반환
    return 0;
  };

  public findPost = async (postId: number) => {
    // 특정 게시글 찾기
    const result = await this.prisma.post.findFirst({ where: { postId } });
    return result;
  };

  public postWriter = async (userId: number) => {
    // 작성자 userId로 글 찾기
    const result = await this.prisma.post.findFirst({ where: { userId } });
    return result;
  };

  public updatePost = async (
    // 게시글 수정
    postId?: number, // 이걸로 검색하는데, 선택값이면 안되지 않을까요?
    userId?: number, // 바뀔 수 없는 부분인데, 굳이 받지 않아도 될것같아요!
    title?: string,
    content?: string,
    category?: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    tag?: string
  ) => {
    const result = await this.prisma.post.update({
      where: { postId },
      data: {
        postId,
        userId,
        title,
        content,
        category,
        appointed,
        updated: 1,
        location1,
        location2,
        tag,
      },
    });
    return result;
  };

  public deadLine = async (postId: number, isDeadLine: number) => {
    // 마감상태 변경
    const result = await this.prisma.post.update({ where: { postId }, data: { isDeadLine } });
    return result;
  };

  public deletePost = async (postId: number) => {
    // 글 삭제
    const images = await this.prisma.postImages.findMany({ where: { postId } });
    await this.prisma.post.findUniqueOrThrow({ where: { postId } }); // 이 친구는 어떤거때문에 쓰셨을까요?

    await this.prisma.post.delete({ where: { postId } });
    await this.prisma.postImages.deleteMany({ where: { postId } });
    return images;
  };
}

export default PostsRepository;
