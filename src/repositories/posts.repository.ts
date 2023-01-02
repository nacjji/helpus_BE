import { notFound } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class PostsRepository {
  prisma: PrismaClient;

  // prisma 스키마를 생성자로 받는다.
  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public createPost = async (
    userId: number,
    userName: string,
    title: string,
    content: string,
    category: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string,
    tag?: string
    // eslint-disable-next-line consistent-return
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
        imageUrl1,
        imageUrl2,
        imageUrl3,
        tag,
      },
    });
    return result;
  };

  public findAllPosts = async (q: number) => {
    // 전체 조회
    const findAllResult = await this.prisma.post.findMany({
      // 무한스크롤
      skip: q || 0,
      // FIXME : 2 to 30
      take: 30,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
      // :FIXME user: {"userName" : "nickname"} --> "userName" : "nickname"
    });
    const wishCount = await this.prisma.wish.aggregate({
      _count: true,
    });
    const result = [...findAllResult, wishCount];
    return result;
  };

  // 카테고리 별로 조회
  public findByCategory = async (q: number, category: number) => {
    const findByCategoryResult = await this.prisma.post.findMany({
      where: { category }, // 무한스크롤
      skip: q || 0,
      // FIXME : 2 to 30
      take: 30,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
    });
    const wishCount = await this.prisma.wish.aggregate({
      _count: true,
    });
    // eslint-disable-next-line no-underscore-dangle
    if (wishCount._count !== 0) {
      const result = [...findByCategoryResult, wishCount];
      return result;
    }
    return findByCategoryResult;
  };

  public findDetailPost = async (postId: number) => {
    const findDetailResult = await this.prisma.post.findUnique({
      where: { postId },
    });
    const wishCount = await this.prisma.wish.aggregate({
      _count: true,
    });
    const result = [findDetailResult, wishCount];
    return result;
  };

  public updatePost = async (
    postId?: number,
    userId?: number,
    title?: string,
    content?: string,
    category?: number,
    appointed?: Date,
    isDeadLine?: number,
    location1?: string,
    location2?: string,
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string,
    tag?: string
  ) => {
    const postExist = await this.prisma.post.findUnique({ where: { postId } });
    if (!postExist) {
      throw notFound('게시글 없음');
    }
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
        isDeadLine,
        location1,
        location2,
        imageUrl1,
        imageUrl2,
        imageUrl3,
        tag,
      },
    });
    return result;
  };

  public deletePost = async (postId: number) => {
    const postExist = await this.prisma.post.findUnique({ where: { postId } });
    if (!postExist) {
      throw notFound('게시글 없음');
    }
    await this.prisma.post.findUniqueOrThrow({ where: { postId } });
    const result = await this.prisma.post.delete({ where: { postId } });
    return result;
  };
}

export default PostsRepository;
