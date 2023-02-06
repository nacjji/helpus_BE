import { notFound } from '@hapi/boom';
import WishsRepository from '../repositories/wish.repository';
import prisma from '../config/database/prisma';
import PostsRepository from '../repositories/post.repository';

class WishsService {
  wishsRepository: WishsRepository;

  postRepository: PostsRepository;

  constructor() {
    this.wishsRepository = new WishsRepository(prisma);
    this.postRepository = new PostsRepository(prisma);
  }

  public wishPost = async (postId: number, userId: number) => {
    const findPost = await this.postRepository.findPost(postId);
    if (!findPost) throw notFound('없는 게시글이거나 삭제된 게시글입니다.');

    const isWish = await this.wishsRepository.isWish(postId, userId);
    if (isWish.length) {
      await this.wishsRepository.wishDelete(postId, userId);
      return { message: '찜 취소', postId };
    }
    this.wishsRepository.wishPost(postId, userId);
    return { message: '찜' };
  };
}

export default WishsService;
