import { badRequest, notFound } from '@hapi/boom';
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

  // eslint-disable-next-line class-methods-use-this
  public myLocationPosts = async (
    q: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
    console.log(search);

    const result = await this.prisma.post.findMany({
      where: {
        AND: [
          {
            AND: [
              { location1: state1 },
              { location2: state2 },
              { category: category || undefined },
            ],
            OR: [
              { title: { contains: search || '' } },
              { content: { contains: search || '' } },
              { userName: { contains: search || '' } },
              { location1: { contains: search || '' } },
              { location2: { contains: search || '' } },
              { tag: { contains: search || '' } },
            ],
          },
        ],
      },
      // 무한스크롤
      skip: q || 0,
      take: 30,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
    });
    return result;
  };

  public allLocationPosts = async (q: number, category: number, search?: string) => {
    console.log('all posts');

    const result = await this.prisma.post.findMany({
      where: {
        OR: [
          {
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
        ],
      },
      // 무한스크롤
      skip: q || 0,
      take: 30,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
    });
    return result;
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
