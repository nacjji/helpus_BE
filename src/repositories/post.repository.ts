import { notFound, unauthorized } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class PostsRepository {
  prisma: PrismaClient;

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
    tag?: string,
    createdAt?: Date,
    imageUrls?: string[]
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
        tag,
        createdAt,
      },
    });

    const imageArr = imageUrls?.map((imageUrl) => {
      return { imageUrl, postId: result.postId, userId };
    });
    await this.prisma.postImages.createMany({
      data: imageArr || [],
    });
    return result;
  };

  public myLocationPosts = async (
    q: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
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
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },

      // 무한스크롤
      skip: q || 0,
      take: 12,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
    });

    return result;
  };

  public allLocationPosts = async (q: number, category: number, search?: string) => {
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
      include: {
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },
      // 무한스크롤
      skip: q || 0,
      take: 12,
      // 생성순으로 정렬
      orderBy: { createdAt: 'desc' },
    });
    return result;
  };

  public findDetailPost = async (postId: number) => {
    const result = await this.prisma.post.findUnique({
      where: { postId },
      include: {
        _count: {
          select: { Wish: true },
        },
        user: { select: { userImage: true } },
        PostImages: { select: { imageUrl: true } },
      },
    });
    return result;
  };

  public isWished = async (userId: number, postId: number) => {
    const result = await this.prisma.wish.findFirst({ where: { AND: [{ userId }, { postId }] } });
    if (result) return 1;
    return 0;
  };

  public findPost = async (postId: number) => {
    const result = await this.prisma.post.findFirst({ where: { postId } });
    return result;
  };

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
