import { PrismaClient } from '@prisma/client';

class PostsRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  // 이 부분에선 이미지를 제외한 텍스트 데이터만 Post 테이블에 추가한다
  public createPost = async (
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

  // 이 부분에선 이미지 데이터를 PostImage 테이블에 생성한다.
  public uploadPostImages = async (imageArr: any) => {
    await this.prisma.postImages.createMany({
      data: imageArr,
    });
  };

  public myLocationPosts = async (
    page: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
    const result = await this.prisma.post.findMany({
      where: {
        // 내위치 게시글에 만족하고, 검색어에 해당하는 게시글을 불러옴
        // 위치와 카테고리에 모두 부합하는지 확인
        AND: [{ location1: state1 }, { location2: state2 }, { category: category || undefined }],
        // 검색어 중 하나라도 일치하는 것들을 불러옴
        OR: [
          { title: { contains: search || '' } },
          { content: { contains: search || '' } },
          { userName: { contains: search || '' } },
          { location1: { contains: search || '' } },
          { location2: { contains: search || '' } },
          { tag: { contains: search || '' } },
        ],
      },
      // 게시글에 표시할 게시글 작성자의 프로필 이미지와 게시글 이미지 포함
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },

      // 무한스크롤을 위한 페이지네이션
      skip: page || 0,
      // 보여주고 싶은 최대 게시글 개수의 배수를 page query에 입력
      take: 12,
      orderBy: { createdAt: 'desc' },
    });

    return result;
  };

  public allLocationPosts = async (page: number, category: number, search?: string) => {
    const result = await this.prisma.post.findMany({
      where: {
        category: category || undefined,
        OR: [
          { title: { contains: search || '' } },
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
    const result = await this.prisma.post.findUnique({
      where: { postId },
      include: {
        // 찜 개수
        _count: {
          select: { Wish: true },
        },
        // 프로필사진, 평점총합, 평점 참여자 수
        user: { select: { userImage: true, score: true, score_total: true } },
        PostImages: { select: { imageUrl: true } },
      },
    });
    return result;
  };

  // 찜여부 확인
  public isWished = async (userId: number, postId: number) => {
    const result = await this.prisma.wish.findFirst({ where: { AND: [{ userId }, { postId }] } });
    // 찜 되어 있으면 1
    if (result) return 1;
    // 찜 안되어있으면 0
    return 0;
  };

  // 게시글 존재 여부 확인, 수정, 삭제, 상세조회, 찜하기에서 사용됨
  public findPost = async (postId: number) => {
    const result = await this.prisma.post.findFirst({ where: { postId } });
    return result;
  };

  // 게시글 작성자 여부 확인, 수정, 삭제, 마감에서 사용됨
  public postWriter = async (userId: number) => {
    const result = await this.prisma.post.findFirst({ where: { userId } });
    return result;
  };

  public updatePost = async (
    postId?: number,
    userId?: number,
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
    const result = await this.prisma.post.update({ where: { postId }, data: { isDeadLine } });
    return result;
  };

  public deletePost = async (postId: number) => {
    const images = await this.prisma.postImages.findMany({ where: { postId } });
    await this.prisma.post.findUniqueOrThrow({ where: { postId } });

    await this.prisma.post.delete({ where: { postId } });
    await this.prisma.postImages.deleteMany({ where: { postId } });
    return images;
  };
}

export default PostsRepository;
