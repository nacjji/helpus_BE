import { Router } from 'express';

import WishsController from '../controllers/wish.controller';
import { requiredLogin } from '../middlewares/auth.middleware';

const wishsRouter = Router();
const wishsController = new WishsController();

wishsRouter.post('/:postId', requiredLogin, wishsController.wishPost); // 특정 글 찜

export default wishsRouter;
