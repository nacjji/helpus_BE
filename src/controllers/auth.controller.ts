import { RequestHandler } from 'express'; // req,res,next 정의된 express 라이브러리 사용
import AuthService from '../services/auth.service'; // Service단에 값 넘기기 위한 import

import {
  emailPattern,
  signupPattern,
  loginPattenrn,
  updatePattern,
} from '../validations/auth.validations'; // 들어온 값의 유효성 검사를 위한 모듈
import { makeCookie, deleteCookie } from '../modules/cookie.module'; // 쿠키 발급 및 삭제를 위한 모듈

class AuthController {
  authService: AuthService; // 서비스단 사용을 위한 내부 변수명

  constructor() {
    // 생성자. 밖에서 이 모듈을 사용하고자 호출할 때 한 번 발동
    this.authService = new AuthService(); // 내부 변수에 Service단 클래스 집어넣음
  }

  //  eslint-disable-next-line class-methods-use-this
  public test: RequestHandler = (req, res, next) => {
    // ㅎㅎㅎㅎ 삭제해야해요 ㅎㅎㅎㅎ
    res.status(200).json({ message: '깃허브 액션 테스트 2' });
  };

  public emailCheck: RequestHandler = async (req, res, next) => {
    // 이메일 중복확인을 위한 함수
    try {
      const { email } = await emailPattern.validateAsync(req.body); // body에서 email이라는 변수를 구조분해할당으로 받을건데, 그 전에 body 자체 유효성 검사 실행
      await this.authService.emailCheck(email); // 유효성 검사에 통과하면 서비스단에 값을 넘겨줌

      res.status(200).json({ message: '사용 가능' });
    } catch (err) {
      next(err);
    }
  };

  public localSignup: RequestHandler = async (req, res, next) => {
    // 회원가입을 위한 함수
    try {
      const { email, password, userName, state1, state2 } = await signupPattern.validateAsync(
        req.body
      ); // body값에 유효성 검사 실행하고, 구조분해할당으로 변수 바등ㅁ

      let fileUrl = ''; // null 값을 넘겨주지 않기 위한 변수 초기화
      if (req.file) {
        // 파일이 들어와서 multer 미들웨어가 제대로 작동하면 해당 필드가 생김
        const { location: userImage } = req.file as Express.MulterS3.File; // file이라는 객체 안에 location이라는 키값에 들어있는 값을 userImage라는 변수에 구조분해할당
        // TODO: 변수명 더 명확히 변경
        fileUrl = userImage.split('/')[userImage.split('/').length - 1]; // 저장된 url을 `/`로 잘라 마지막 값, 즉 파일 이름만 가져옴. fileName이 더 명확한 변수명인듯
      }

      await this.authService.localSignup(email, password, userName, state1, state2, fileUrl); // 받은 값들을 서비스단에 넘김
      res.status(201).json({ message: '가입 완료' });
    } catch (err) {
      next(err);
    }
  };

  public localLogin: RequestHandler = async (req, res, next) => {
    // 로그인을 위한 함수
    try {
      const { email, password } = await loginPattenrn.validateAsync(req.body); // body 유효성 검사하고 변수 받음
      const result = await this.authService.localLogin(email, password); // 서비스단에 값 넘겨줌

      res.locals.access = result.accessToken; // 토큰 발급 모듈에서 사용할 수 있도록 res.locals에 결과로 받은 값들을 저장
      res.locals.refresh = result.refreshToken;

      // TODO: 쿠키 발급 모듈 -> 미들웨어화 진행
      makeCookie(req, res, next); // 토큰 발급 모듈 실행. 모듈 말고 미들웨어화 하려다가 넘어갔는데 다시 시도해보면 이 줄은 필요없어질듯

      res.status(200).json({
        // 로그인한 유저 정보를 넘겨 프론트에서 활용 가능하도록 함
        userId: result.userId,
        userName: result.userName,
        userImage: result.userImage,
        state1: result.state1,
        state2: result.state2,
      });
    } catch (err) {
      next(err);
    }
  };

  public detailUser: RequestHandler = async (req, res, next) => {
    // 유저 정보를 가져오기 위한 함수
    try {
      const userInfo = await this.authService.detailUser(res.locals.userId); // 앞서 인증 미들웨어에서 저장된 locals에서 userId 필드를 서비스단에 전달

      res.status(200).json(userInfo); // 요청한 유저 정보를 클라이언트에 넘겨줌
    } catch (err) {
      next(err);
    }
  };

  public updateUser: RequestHandler = async (req, res, next) => {
    // 유저 정보 업데이트를 위한 함수
    try {
      const { userName, state1, state2 } = await updatePattern.validateAsync(req.body); // 필수값 누락되지 않게 하기 위한
      const { userId } = res.locals; // 인증 미들웨어에서 저장한 rocals의 userId 가져옴

      await this.authService.updateUser(userId, userName, state1, state2); // 서비스단에 값 넘김

      res.status(200).json({ userName, state1, state2 }); // 변경됐을 가능성 있는 정보를 모두 클라이언트에 전달
    } catch (err) {
      next(err);
    }
  };

  public updateImage: RequestHandler = async (req, res, next) => {
    // 유저 이미지 변경을 위한 함수
    const { location: userImage } = req.file as Express.MulterS3.File; // 멀터에서 저장된 location내 값을 가져옴
    const fileUrl = userImage.split('/'); // `/`단위로 저장된 url 자름

    try {
      const { userId } = res.locals; // rocals에 저장된 userId 받음
      await this.authService.updateImage(userId, fileUrl[fileUrl.length - 1]); // 잘라둔 내용 중 제일 마지막(파일명)과 userId 전달

      res.status(200).json({ userImage }); // 변경된 이미지 주소를 클라이언트에 전달
    } catch (err) {
      next(err);
    }
  };

  public deleteImage: RequestHandler = async (req, res, next) => {
    // 유저 이미지 삭제를 위한 함수
    try {
      const { userId } = res.locals; // locals에서 userId 가져옴
      const userImage = await this.authService.deleteImage(userId); // userId를 서비스단에 전달하고, 랜덤 이미지 주소를 받음

      res.status(200).json({ userImage }); // 새로 표시해야하는 이미지 주소를 클라이언트에 전달
    } catch (err) {
      next(err);
    }
  };

  public wishlist: RequestHandler = async (req, res, next) => {
    // 찜목록을 불러오기 위한 함수
    try {
      const { page } = req.query;
      const results = await this.authService.wishlist(res.locals.userId, Number(page)); // 가져와야 할 페이지와 locals에 저장된 userId를 서비스단에 넘김
      res.status(200).json(results); // 결과로 받은 목록들을 클라이언트에 전달
    } catch (err) {
      next(err);
    }
  };

  public changePassword: RequestHandler = async (req, res, next) => {
    // 비밀번호 변경을 위한 함수
    try {
      const { userId } = res.locals; // locals에 저장된 userId
      const { newPw, password } = req.body; // body를 통해 현재 비밀번호와 새 비밀번호를 받음

      await this.authService.changePassword(userId, newPw, password); // 변수들을 서비스단에 전달
      res.status(200).json({ message: '비밀번호 변경 성공' }); // 오류가 없으면 값 넘김 없이 종료
    } catch (err) {
      next(err);
    }
  };

  public getUserDetail: RequestHandler = async (req, res, next) => {
    // 특정 사용자의 정보를 얻기 위한 함수
    try {
      const { userId } = req.params; // params를 통해 userId 얻음

      const result = await this.authService.detailUser(Number(userId)); // 변수가 무조건 문자열이기 때문에, 형변환하여 서비스단에 전달
      res.status(200).json(result); // 넘겨받은 객체를 클라이언트에 전달
    } catch (err) {
      next(err);
    }
  };

  public deleteUser: RequestHandler = async (req, res, next) => {
    // 회원 탈퇴를 위한 함수
    try {
      const { userId } = res.locals; // locals에서 userId 얻음
      await this.authService.deleteUser(userId); // 해당 변수를 서비스단에 전달

      deleteCookie(req, res, next); // 탈퇴가 정상적으로 되고나면 쿠키 삭제

      // TODO: userId 삭제
      res.status(200).json({ message: '탈퇴 완료', userId }); // userId 클라이언트에서 안쓴다니 추후 삭제요망
      next();
    } catch (err) {
      next(err);
    }
  };

  public score: RequestHandler = async (req, res, next) => {
    // 특정 유저에게 점수 주는 함수
    try {
      // TODO: score에 대한 범위값 유효성 검사는 필요없을까요? 필요하다고 봅니다.
      const { score, userId } = req.body;
      await this.authService.score(userId, score);
      await scorePattern.validateAsync(req.body);
      return res.status(201).json({ message: `userId ${userId} 에게 평점 완료` });
    } catch (err) {
      return next(err);
    }
  };

  public myPosts: RequestHandler = async (req, res, next) => {
    // 내 게시물 목록 조회를 위한 함수
    try {
      const { page } = req.query;
      const { userId } = res.locals;
      const results = await this.authService.myPosts(userId, Number(page));
      return res.status(200).json({ results });
    } catch (err) {
      return next(err);
    }
  };
}

export default AuthController;
