import { RequestHandler } from 'express';
import WishsService from '../services/wish.service';

class WishsController {
  wishsService: WishsService;

  constructor() {
    this.wishsService = new WishsService();
  }

  // eslint-disable-next-line consistent-return
  public wishPost: RequestHandler = async (req, res, next) => {
    // 찜 등록/취소 함수
    try {
      const { postId } = req.params;
      const { userId } = res.locals;
      const result = await this.wishsService.wishPost(Number(postId), userId);
      return res.status(201).json({ message: result.message, postId }); // 결과에 따른 메시지가 달라지는 처리 좋은것 같아요!
    } catch (err) {
      return next(err);
    }
  };
}

export default WishsController;
