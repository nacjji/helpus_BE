import { notFound } from '@hapi/boom';
import WishsRepository from '../repositories/wish.repository';
import prisma from '../config/database/prisma';

class WishsService {
  wishsRepository: WishsRepository;

  constructor() {
    this.wishsRepository = new WishsRepository(prisma);
  }

  public wishPost = async (postId: number, userId: number) => {
    const result = await this.wishsRepository.wishPost(Number(postId), userId);
    console.log(result);
    return { message: result[0], postId };
  };
}

export default WishsService;
