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

  // public searchPost = async (userId: number, search: string, q?: number) => {
  //   const result = await this.prisma.post.findMany({
  //     where: {
  //       OR: [
  //         { title: { contains: search } },
  //         { content: { contains: search } },
  //         { userName: { contains: search } },
  //         { location1: { contains: search } },
  //         { location2: { contains: search } },
  //         { tag: { contains: search } },
  //       ],
  //     },
  //     skip: q || 0,
  //     // FIXME : 2 to 30
  //     take: 30,
  //     // 생성순으로 정렬
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   return result;
  // };

  public findAllPosts = async (
    userId: number,
    q: number,
    mylocation?: string,
    category?: number,
    search?: string
  ) => {
    const userLocation = await this.prisma.user.findMany({ where: { userId } });
    console.log(userId, 'in repo');
    // mylocation query 가 'true' 일 경우
    if (mylocation && category) {
      if (!userId) {
        throw badRequest('내 위치 게시글 찾기는 로그인 후 이용 가능한 기능입니다.');
      }
      const findAllMyLocation = await this.prisma.post.findMany({
        where: {
          AND: [{ location1: userLocation[0].state1 }, { location2: userLocation[0].state2 }],
          category,
        },
        // 무한스크롤
        skip: q || 0,
        take: 30,
        // 생성순으로 정렬
        orderBy: { createdAt: 'desc' },
      });

      const wishCount = await this.prisma.wish.aggregate({
        _count: true,
      });
      const result = [findAllMyLocation, wishCount];
      return result;
    }
    if (mylocation && !category) {
      if (!userId) {
        throw badRequest('내 위치 게시글 찾기는 로그인 후 이용 가능한 기능입니다.');
      }
      const findAllMyLocation = await this.prisma.post.findMany({
        where: {
          AND: [{ location1: userLocation[0].state1 }, { location2: userLocation[0].state2 }],
        },
        // 무한스크롤
        skip: q || 0,
        take: 30,
        // 생성순으로 정렬
        orderBy: { createdAt: 'desc' },
      });

      const wishCount = await this.prisma.wish.aggregate({
        _count: true,
      });
      const result = [findAllMyLocation, wishCount];
      return result;
    }
    if (category) {
      const allPostsCategory = await this.prisma.post.findMany(
        // 무한스크롤
        {
          where: { category },
          skip: q || 0,
          take: 30,
          // 생성순으로 정렬
          orderBy: { createdAt: 'desc' },
        }
      );
      return allPostsCategory;
    }
    const allPosts = await this.prisma.post.findMany(
      // 무한스크롤
      {
        skip: q || 0,
        take: 30,
        // 생성순으로 정렬
        orderBy: { createdAt: 'desc' },
      }
    );
    return allPosts;
  };

  // 카테고리 별로 조회
  // public findByCategory = async (q: number, category: number, search: string) => {
  //   if (!search) {
  //     const findByCategoryResult = await this.prisma.post.findMany({
  //       where: { category }, // 무한스크롤
  //       skip: q || 0,
  //       // FIXME : 2 to 30
  //       take: 30,
  //       // 생성순으로 정렬
  //       orderBy: { createdAt: 'desc' },
  //     });
  //     const wishCount = await this.prisma.wish.aggregate({
  //       _count: true,
  //     });
  //     // eslint-disable-next-line no-underscore-dangle
  //     if (wishCount._count !== 0) {
  //       const result = [...findByCategoryResult, wishCount];
  //       return result;
  //     }
  //     return findByCategoryResult;
  //   }
  //   const findByCategoryResult = await this.prisma.post.findMany({
  //     where: {
  //       category,
  //       OR: [
  //         { title: { contains: search } },
  //         { content: { contains: search } },
  //         { userName: { contains: search } },
  //         { location1: { contains: search } },
  //         { location2: { contains: search } },
  //         { tag: { contains: search } },
  //       ],
  //     }, // 무한스크롤
  //     skip: q || 0,
  //     // FIXME : 2 to 30
  //     take: 30,
  //     // 생성순으로 정렬
  //     orderBy: { createdAt: 'desc' },
  //   });
  //   const wishCount = await this.prisma.wish.aggregate({
  //     _count: true,
  //   });
  //   // eslint-disable-next-line no-underscore-dangle
  //   if (wishCount._count !== 0) {
  //     const result = [...findByCategoryResult, wishCount];
  //     return result;
  //   }
  //   return findByCategoryResult;
  // };

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
