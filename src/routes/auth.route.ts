import { Router } from 'express';
import { profileUploader } from '../middlewares/multer.uploader';
import KakaoAuthController from '../controllers/kakao.auth.controller';
import AuthController from '../controllers/auth.controller';
import * as auth from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = new AuthController();
const kakaoAuthController = new KakaoAuthController();

authRouter.get('/kakao', kakaoAuthController.kakao);
authRouter.post('/kakao/state', kakaoAuthController.kakaoState);

authRouter.post('/email', auth.requiredNoLogin, authController.emailCheck);
authRouter.post(
  '/signup',
  auth.requiredNoLogin,
  profileUploader.single('userImage'),
  authController.localSignup
);
authRouter.post('/login', auth.requiredNoLogin, authController.localLogin);

authRouter.get('/detail', auth.requiredLogin, authController.detailUser);
authRouter.get('/wishlist', auth.requiredLogin, authController.wishlist);

export default authRouter;
