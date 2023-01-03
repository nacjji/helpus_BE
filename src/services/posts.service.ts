import { notFound } from '@hapi/boom';
import PostsRepository from '../repositories/posts.repository';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';

class PostsService {
  postsRepository: PostsRepository;

  authRepository: AuthRepository | undefined;

  constructor() {
    this.postsRepository = new PostsRepository(prisma);
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
  ) => {
    const imageFileName1 = imageUrl1?.split('/');
    const imageFileName2 = imageUrl2?.split('/');
    const imageFileName3 = imageUrl3?.split('/');

    const result = await this.postsRepository.createPost(
      userId,
      userName,
      title,
      content,
      Number(category),
      appointed,
      location1,
      location2,
      imageFileName1 ? imageFileName1[4] : undefined,
      imageFileName2 ? imageFileName2[4] : undefined,
      imageFileName3 ? imageFileName3[4] : undefined,
      tag
    );
    return result;
  };

  // 에러가 났음에도 사진이 s3 에 업로드 됨

  // 게시글 검색
  public searchPost = async (userId: number, search: string, q: number) => {
    const result = await this.postsRepository.searchPost(userId, search, q);
    return result;
  };

  // 내 위치 게시글
  public myLocation = async (q: number, userId: number) => {
    const result = await this.postsRepository.myLocation(q, userId);
    return result;
  };

  // 전체 조회
  public findAllPosts = async (q: number) => {
    const result = await this.postsRepository.findAllPosts(q);
    if (result.length === 1) {
      // 게시글 없을 때 204
    }
    return result;
  };

  public findByCategory = async (q: number, category: number) => {
    const result = await this.postsRepository.findByCategory(q, category);
    return result;
  };

  public findDetailPost = async (postId: number) => {
    const result = await this.postsRepository.findDetailPost(postId);
    if (!result) {
      throw notFound('게시글 없음');
    }
    return result;
  };

  public updatePost = async (
    postId: number,
    userId: number,
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
    const imageFileName1 = imageUrl1?.split('/');
    const imageFileName2 = imageUrl2?.split('/');
    const imageFileName3 = imageUrl3?.split('/');

    const result = await this.postsRepository.updatePost(
      Number(postId),
      Number(userId),
      title,
      content,
      Number(category),
      appointed,
      Number(isDeadLine),
      location1 || undefined,
      location2 || undefined,
      imageFileName1 ? imageFileName1[4] : undefined,
      imageFileName2 ? imageFileName2[4] : undefined,
      imageFileName3 ? imageFileName3[4] : undefined,
      tag
    );
    if (!result) {
      throw notFound('게시글 없음');
    }
    return result;
  };

  public deletePost = async (postId: number) => {
    const result = await this.postsRepository.deletePost(postId);
    return result;
  };
}

export default PostsService;
