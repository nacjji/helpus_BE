import { PrismaClient } from '@prisma/client';

class PostsRepository {
  prisma: PrismaClient;

  // prisma 스키마를 생성자로 받는다.
  constructor(prisma: any) {
    this.prisma = prisma;
  }

  createPost = async (
    userId: number,
    title: string,
    content: string,
    updated?: boolean,
    location1?: string,
    location2?: string,
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string
    // eslint-disable-next-line consistent-return
  ) => {
    const result = await this.prisma.post.create({
      data: {
        userId,
        title,
        content,
        updated,
        location1,
        location2,
        imageUrl1,
        imageUrl2,
        imageUrl3,
      },
    });
    return result;
  };
}

export default PostsRepository;
