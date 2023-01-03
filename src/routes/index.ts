import { Router } from 'express';
import expressRateLimit from 'express-rate-limit';
import authRouter from './auth.route';
import postsRouter from './posts.route';

const router = Router();

// router.use(
//   expressRateLimit({
//     windowMs: 1 * 1000,
//     max: 5,
//     message: '요청이 너무 많습니다!',
//   })
// );
router.get('/', (req, res) => res.json({ message: 'OK' }));
router.use('/user', authRouter);
router.use('/post', postsRouter);

export default router;
