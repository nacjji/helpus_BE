import { RequestHandler } from 'express';
import WishsService from '../services/wish.service';

class WishsController {
  wishsService: WishsService;

  constructor() {
    this.wishsService = new WishsService();
  }

  public wishPost: RequestHandler = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { userId } = res.locals;
      const result = await this.wishsService.wishPost(Number(postId), userId);
      return res.status(201).json({ message: result.message, postId });
    } catch (err) {
      return next(err);
    }
  };
}

export default WishsController;
