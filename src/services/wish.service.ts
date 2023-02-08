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
    // post.repository 에 있는 게시글 찾기 메소드
    const findPost = await this.postRepository.findPost(postId);
    if (!findPost) throw notFound('없는 게시글이거나 삭제된 게시글입니다.');

    // wish.repository 에 있는 찜 여부 찾기 메소드, 찜한 게시글이 배열 형태
    const isWish = await this.wishsRepository.isWish(postId, userId);

    // 배열 형태의 반환값이 빈 배열이 아니라면(이미 찜을 했다면)
    if (isWish.length) {
      // 찜 삭제
      await this.wishsRepository.wishDelete(postId, userId);
      return { message: '찜 취소', postId };
    }
    // 아직 찜 안했다면 찜
    this.wishsRepository.wishPost(postId, userId);
    return { message: '찜' };
  };
}

export default WishsService;
