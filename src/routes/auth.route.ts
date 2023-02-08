import { Router } from 'express'; // express로 서버 동작
import { profileUploader } from '../middlewares/multer.uploader'; // 이미지 등록을 위해 post와 다른 메소드 사용
import KakaoAuthController from '../controllers/kakao.auth.controller'; // 카카오 로그인 및 회원가입을 위한 컨트롤러단
import AuthController from '../controllers/auth.controller'; // 대부분의 유저 로직을 위한 컨트롤러단
import * as auth from '../middlewares/auth.middleware'; // 인증 미들웨어

const authRouter = Router(); // 내보낼 변수에 Router 할당
const authController = new AuthController(); // 컨트롤러 클래스
const kakaoAuthController = new KakaoAuthController(); // 카카오 컨트롤러 클래스

// TODO: 삭제해야 할 테스트 api
authRouter.get('/test', authController.test);

authRouter.get('/kakao', kakaoAuthController.kakao); // 카카오 로그인 및 회원가입
authRouter.post('/kakao/state', kakaoAuthController.kakaoState); // 카카오 유저의 지역 설정

authRouter.post('/email', auth.requiredNoLogin, authController.emailCheck); // 이메일 중복 확인
authRouter.post(
  // 회원가입
  '/signup',
  auth.requiredNoLogin,
  profileUploader.single('userImage'),
  authController.localSignup
);
authRouter.post('/login', auth.requiredNoLogin, authController.localLogin); // 로컬 로그인

authRouter.get('/detail', auth.requiredLogin, authController.detailUser); // 유저 정보 조회
authRouter.get('/myposts', auth.requiredLogin, authController.myPosts); // 내 게시글 조회

authRouter.patch('/detail', auth.requiredLogin, authController.updateUser); // 유저 정보 변경
authRouter.patch(
  // 유저 이미지 변경
  '/image',
  auth.requiredLogin,
  profileUploader.single('userImage'),
  authController.updateImage
);
authRouter.delete('/image', auth.requiredLogin, authController.deleteImage); // 유저 이미지 삭제
authRouter.get('/wishlist', auth.requiredLogin, authController.wishlist); // 찜목록 조회
authRouter.patch('/password', auth.requiredLogin, authController.changePassword); // 비밀번호 변경
authRouter.get('/:userId/detail', authController.getUserDetail); // 특정 유저 정보 조회

authRouter.delete('/delete', auth.requiredLogin, authController.deleteUser); // 회원 탈퇴
authRouter.delete('/delete/kakao', auth.requiredLogin, kakaoAuthController.kakaoDelete); // 카카오 유저 탈퇴
authRouter.patch('/score', auth.requiredLogin, authController.score); // 평가 남기기

export default authRouter;
