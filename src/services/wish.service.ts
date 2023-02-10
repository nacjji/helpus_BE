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
    // 찜 등록/취소 로직
    const findPost = await this.postRepository.findPost(postId); // 글 있는지 먼저 확인
    if (!findPost) throw notFound('없는 게시글이거나 삭제된 게시글입니다.');

    // 여기 로직을 wish를 통해서만 할 수도 있을 것 같아요. wish를 애초에 조회하는데, postId가 없는 경우에는 조인이 안 되지 않나 생각이 듭니다.
    const isWish = await this.wishsRepository.isWish(postId, userId); // 그리고나서 찜 리스트 확인
    if (isWish.length) {
      // 이미 찜했었던 목록에 있으면
      await this.wishsRepository.wishDelete(postId, userId); // 기록 없애고
      return { message: '찜 취소', postId }; // 취소 메시지
    }
    this.wishsRepository.wishPost(postId, userId); // 기록 없으면 만들고
    return { message: '찜' }; // 찜 메시지
  };
}

export default WishsService;
