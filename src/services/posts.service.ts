import PostsRepository from '../repositories/posts.repository';
import prisma from '../config/database/prisma';

class PostsService {
  postsRepository: PostsRepository;

  constructor() {
    this.postsRepository = new PostsRepository(prisma);
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
  ) => {
    const result = await this.postsRepository.createPost(
      userId,
      title,
      content,
      updated,
      location1,
      location2,
      imageUrl1,
      imageUrl2,
      imageUrl3
    );
    return result;
  };
}

export default PostsService;
