import { notFound } from '@hapi/boom';
import WishsRepository from '../repositories/wishs.repository';
import prisma from '../config/database/prisma';

class WishsService {
  wishsRepository: WishsRepository;

  constructor() {
    this.wishsRepository = new WishsRepository(prisma);
  }

  public wishPost = async (postId: number, userId: number) => {
    const result = await this.wishsRepository.wishPost(Number(postId), userId);
    return result;
  };
}

export default WishsService;
