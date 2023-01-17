import { Request, Response, NextFunction } from 'express';
import WishsService from '../services/wish.service';

class WishsController {
  wishsService: WishsService;

  constructor() {
    this.wishsService = new WishsService();
  }

  // eslint-disable-next-line consistent-return
  public wishPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;

      const { userId } = res.locals;
      const result = await this.wishsService.wishPost(Number(postId), userId);
      return res.status(201).json({ message: result.message, postId: result.postId });
    } catch (err) {
      return next(err);
    }
  };
}

export default WishsController;
