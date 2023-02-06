import { Router } from 'express';
import { profileUploader } from '../middlewares/multer.uploader';
import KakaoAuthController from '../controllers/kakao.auth.controller';
import AuthController from '../controllers/auth.controller';
import * as auth from '../middlewares/auth.middleware';

const authRouter = Router();
const authController = new AuthController();
const kakaoAuthController = new KakaoAuthController();

authRouter.get('/test', authController.test);

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
authRouter.get('/myposts', auth.requiredLogin, authController.myPosts);

authRouter.patch('/detail', auth.requiredLogin, authController.updateUser);
authRouter.patch(
  '/image',
  auth.requiredLogin,
  profileUploader.single('userImage'),
  authController.updateImage
);
authRouter.delete('/image', auth.requiredLogin, authController.deleteImage);
authRouter.get('/wishlist', auth.requiredLogin, authController.wishlist);
authRouter.patch('/password', auth.requiredLogin, authController.changePassword);
authRouter.get('/:userId/detail', authController.getUserDetail);

authRouter.delete('/delete', auth.requiredLogin, authController.deleteUser);
authRouter.delete('/delete/kakao', auth.requiredLogin, kakaoAuthController.kakaoDelete);
authRouter.patch('/score', auth.requiredLogin, authController.score);

export default authRouter;
