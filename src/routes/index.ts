import { Router } from 'express';
import authRouter from './auth.route';
import postsRouter from './post.route';
import wishsRouter from './wish.route';
import chatRouter from './chat.route';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'OK' }));
router.use('/user', authRouter);
router.use('/post', postsRouter);
router.use('/wish', wishsRouter);
router.use('/chat', chatRouter);

export default router;
