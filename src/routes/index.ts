import { Router } from 'express';
import expressRateLimit from 'express-rate-limit';
import authRouter from './auth.route';
import postsRouter from './posts.route';
import commentsRouter from './comments.route';

const router = Router();

// router.use(
//   expressRateLimit({
//     windowMs: 1 * 1000,
//     max: 5,
//     message: '요청이 너무 많습니다!',
//   })
// );
router.get('/', (req, res) => res.json({ message: 'OK' }));
router.use('/auth', authRouter);
router.use('/', commentsRouter);
router.use('/post', postsRouter);

export default router;
