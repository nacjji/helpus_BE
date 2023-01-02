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
    category: number,
    appointed: Date,
    updated?: boolean,
    location1?: string,
    location2?: string,
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string,
    tag?: string
  ) => {
    const imageFileName1 = imageUrl1?.split('/');
    const imageFileName2 = imageUrl2?.split('/');
    const imageFileName3 = imageUrl3?.split('/');

    const result = await this.postsRepository.createPost(
      userId,
      title,
      content,
      category,
      appointed,
      updated,
      location1,
      location2,
      imageFileName1 ? imageFileName1[4] : undefined,
      imageFileName2 ? imageFileName2[4] : undefined,
      imageFileName3 ? imageFileName3[4] : undefined,
      tag
    );
    return result;
  };

  findAllPosts = async (q: number) => {
    const result = await this.postsRepository.findAllPosts(q);
    return result;
  };

  findDetailPost = async (postId: number) => {
    const result = await this.postsRepository.findDetailPost(postId);
    return result;
  };

  updatePost = async (
    postId: number,
    userId: number,
    title?: string,
    content?: string,
    category?: number,
    appointed?: Date,
    isDeadLine?: boolean,
    updated?: boolean,
    location1?: string,
    location2?: string,
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string,
    tag?: string
  ) => {
    const result = await this.postsRepository.updatePost(
      postId,
      userId,
      title,
      content,
      category,
      appointed,
      isDeadLine,
      updated,
      location1,
      location2,
      imageUrl1,
      imageUrl2,
      imageUrl3,
      tag
    );
    return result;
  };

  deletePost = async (postId: number) => {
    const result = await this.postsRepository.deletePost(postId);
    return result;
  };
}

export default PostsService;
