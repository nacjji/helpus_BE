import { Router } from 'express';
import multeruploader from '../middlewares/multer.uploader';
import KakaoAuthController from '../controllers/kakao.auth.controller';
import AuthController from '../controllers/auth.controller';

const authRouter = Router();
const authController = new AuthController();
const kakaoAuthController = new KakaoAuthController();

authRouter.get('/kakao', kakaoAuthController.kakao);
authRouter.post('/kakao/state', kakaoAuthController.kakaoState);

authRouter.post('/email', authController.emailCheck);
authRouter.post('/signup', multeruploader.single('userImage'), authController.localSignup);
authRouter.post('/login', authController.localLogin);

export default authRouter;
