import { Router } from 'express';
import authRouter from './auth.route';
import postsRouter from './post.route';
import wishsRouter from './wish.route';
import chatRouter from './chat.route';
import reportRouter from './report.route';
import tokenRouter from './token.route';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'OK' }));
router.use('/token', tokenRouter);
router.use('/user', authRouter);
router.use('/post', postsRouter);
router.use('/wish', wishsRouter);
router.use('/chat', chatRouter);
router.use('/report', reportRouter);

export default router;
