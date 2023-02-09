import { badRequest, notFound } from '@hapi/boom'; // 에러처리를 편리하게 하기 위한 라이브러리
import bcrypt from 'bcrypt'; // 비밀번호 암호화를 위한 라이브러리
import AuthRepository from '../repositories/auth.repository'; // 레포지토리단
import prisma from '../config/database/prisma'; // 레포지토리단 생성자를 위한 DB
import { deleteS3Image } from '../middlewares/multer.uploader'; // 이미지 변경, 삭제 시 S3에서 지우기 위한 모듈
import { makeAccessToken, makeRefreshToken } from '../modules/token.module'; // 토큰 생성을 위한 모듈

const { salt } = process.env as { salt: string }; // 비밀번호 암호화할 때 사용할 salt값
const { S3_BUCKET_URL } = process.env as { S3_BUCKET_URL: string }; // 이미지를 저장하고 삭제하고 할 때 사용할 버킷 주소

class AuthService {
  authRepository: AuthRepository; // 레포지토리단 연결에 쓸 내부 변수

  constructor() {
    this.authRepository = new AuthRepository(prisma); // 레포지토리 클래스 생성하며 db설정 넣어줌
  }

  public emailCheck = async (email: string) => {
    // 이메일 중복 확인
    const check = await this.authRepository.emailCheck(email); // db에 받은 email 넘기고 결과 받음

    if (check) throw badRequest('중복된 이메일'); // 결과가 null이 아닌 경우 에러 던짐

    // TODO: 리턴값 없어도 되지 않나
    return check; // 굳이 필요한 리턴값이 아닌 듯
  };

  public localSignup = async (
    // 회원가입 로직
    email: string,
    password: string,
    userName: string,
    state1: string,
    state2: string,
    profileImage?: string
  ) => {
    const check = await this.authRepository.emailCheck(email); // 비정상 요청인 경우 중복확인 없이 값 전달 가능성 있어 넣은 체크부분
    if (check) throw badRequest('사용 중인 이메일'); // 결과가 있으면 에러 던짐

    // TODO: 계산식 위치 바꾸기
    const date = new Date(); // 랜덤이미지 번호를 위한 계산 부분
    const seed = Number(date) % 20; // 여기 있으면 이미지가 있는 경우에는 쓸모없는 계산이 되지 않나?

    const hash = await bcrypt.hash(password, Number(salt)); // salt값을 이용해 비밀번호 암호화
    // TODO: 불필요한 result 변수 삭제
    const result = await this.authRepository.createUser(
      email,
      userName,
      hash,
      state1,
      state2,
      profileImage || `random/${seed}.png` // 이미지를 등록해 값이 넘어왔으면 파일명, 없으면 랜덤이미지 값
    );
    return result; // controller 보니까 이 값 클라이언트에 안가던데?
  };

  public localLogin = async (email: string, password: string) => {
    // 로그인 로직
    const user = await this.authRepository.emailCheck(email); // 이메일로 사용자 정보 가져옴
    if (!user) throw badRequest('이메일/비밀번호 불일치'); // 정보가 없으면 에러 던짐
    // TODO: 이메일은 있는데 비밀번호 없는 경우가 있을 수 없어짐
    if (!user.password) throw badRequest('로컬 회원 아님'); // 카카오 유저는 이메일이 아예 없어서 해당 부분 불필요해짐

    const match = await bcrypt.compare(password, user.password); // 저장된 해시 비밀번호와 지금 입력한 비밀번호가 일치할 수 있는지 확인
    if (!match) throw badRequest('이메일/비밀번호 불일치'); // 일치하지 않으면 에러 던짐

    if (!user.state1 || !user.state2) throw badRequest('주소값 없는 사용자'); // state값이 정상적이지 않으면 에러 던짐

    const accessToken = await makeAccessToken(user.userId, user.userName, user.state1, user.state2);
    const refreshToken = await makeRefreshToken(); // 받아온 정보들을 가지고 토큰 발급

    await this.authRepository.saveToken(user.userId, accessToken, refreshToken); // 발급한 토큰을 db에 저장하기 위해 넘김

    return {
      userId: user.userId,
      userName: user.userName,
      // TODO: Image 나가는 조건 변경
      userImage: !user.kakao // 카카오 사용자가 이 함수에 들어올 수 없음. 아닌 경우가 없으므로 3항연산자 사용할 필요가 없어짐
        ? `${process.env.S3_BUCKET_URL}/profile/${user.userImage}`
        : user.userImage,
      state1: user.state1,
      state2: user.state2,
      accessToken,
      refreshToken,
    };
  };

  public detailUser = async (userId: number) => {
    // 유저 정보 확인을 위한 로직
    const userInfo = await this.authRepository.userInfo(userId); // userId로 정보 검색

    if (!userInfo)
      throw badRequest('요구사항에 맞지 않는 입력값'); // 해당하는 사용자가 없는 경우 에러 던짐
    // TODO: else 삭제
    else {
      // else가 필요한가? 불필요하게 한 단계 깊어짐
      const imageUrl = userInfo.userImage.includes('kakaocdn') // 카카오 이미지의 경우 필수로 포함되는 문자열을 포함하는지
        ? userInfo.userImage // 포함된다면 그대로 나가면 됨
        : `${process.env.S3_BUCKET_URL}/profile/${userInfo?.userImage}`; // 아니라면 버킷 주소 붙여줌

      return {
        userId: userInfo.userId,
        userName: userInfo.userName,
        userImage: imageUrl,
        email: userInfo.email,
        state1: userInfo.state1,
        state2: userInfo.state2,
        score: Math.trunc(userInfo.score / userInfo.score_total), // Math.trunc 메소드를 이용해 정수부분만 반환
        reportCount: userInfo.Report.length,
      };
    }
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    // 유저 정보 업데이트
    // TODO: 검색 해보고 에러처리
    await this.authRepository.updateUser(userId, userName, state1, state2); // 어차피 db에 안들어가면 에러나니까 그냥 했는데, 에러메시지랑 코드를 위한 에러처리 필요할듯
  };

  public wishlist = async (userId: number, q: number) => {
    // 찜목록 조회 로직
    const posts = await this.authRepository.wishlist(userId, q); // 페이지와 함께 전달
    const results = posts.map((v: any) => {
      // TODO: 모든 맵에서. v 말고 명확한 변수명 사용할것
  public wishlist = async (userId: number, page: number) => {
    const posts = await this.authRepository.wishlist(userId, page);
    const result = posts.map((post: any) => {
      return {
        postId: post.postId,
        userId: post.post.userId,
        userName: post.post.user.userName,
        userImage: post.post.user.userImage.includes('http://')
          ? post.post.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${post.post.user.userImage}`,
        title: post.post.title,
        content: post.post.content,
        category: post.post.category,
        appointed: post.post.appointed,
        isDeadLine: post.post.isDeadLine,
        location1: post.post.location1,
        location2: post.post.location2,
        thumbnail:
          post.post.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? post.post.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${post.post.PostImages[0].imageUrl}`,
        tag: post.post.tag,
        createdAt: post.post.createdAt,
        updated: post.post.updated,
      };
    });
    return result;
  };

  public updateImage = async (userId: number, userImage: string) => {
    // 프로필 이미지 변경 로직
    const user = await this.authRepository.userInfo(userId); // 있는 유저인지 확인
    if (!user) {
      // 없는 경우
      if (!userImage.includes('/')) deleteS3Image(userImage); // 방금 업로드된 이미지 삭제하고
      throw badRequest('해당 유저 없음'); // 에러 던짐
    }
    await this.authRepository.updateImage(userId, userImage); // 있는경우 유저 아이디와 파일명 등록
    if (!user.userImage.includes('/')) deleteS3Image(user.userImage); // 기존에 있던 이미지가 랜덤이미지 아닌 경우 S3에서 삭제
  };

  public deleteImage = async (userId: number) => {
    // 프로필 이미지 삭제 로직
    const user = await this.authRepository.userInfo(userId); // 유저 있는지 확인
    if (!user) throw badRequest('해당 유저 없음'); // 없으면 에러

    const date = new Date();
    const seed = Number(date) % 20; // 랜덤이미지로 바뀌어야하니 이미지값 생성

    // TODO: 결과값 반환받지 않아도 됨. 불필요한 변수 줄이기
    const result = await this.authRepository.updateImage(userId, `random/${seed}.png`); // 랜덤 이미지 주소를 db에 저장

    if (!user.userImage.includes('/')) deleteS3Image(user.userImage); // 기존 이미지를 s3에서 삭제
    return `${S3_BUCKET_URL}/profile/${result.userImage}`; // 바뀐 이미지 url 반환
  };

  public changePassword = async (userId: number, newPw: string, oldPw: string) => {
    // 비밀번호 변경 로직
    const isUser = await this.authRepository.searchPassword(userId); // 비밀번호 가져옴
    if (!isUser) throw badRequest('해당 유저 없음'); // 없으면 에러 던짐
    if (!isUser.password) throw badRequest('로컬 회원 아님'); // 필요할까? 아래에서 값 쓰는것때문에 작성했던 것 같기도

    const match = await bcrypt.compare(oldPw, isUser.password); // 입력한 기존 비밀번호가 db 값과 맞는지 확인

    if (match) {
      // 맞으면
      const hash = await bcrypt.hash(newPw, Number(salt)); // 새 비밀번호 암호화
      await this.authRepository.updatePassword(userId, hash); // 암호화된 비밀번호를 db에 저장
    }
    // TODO: if-else 없이해결
    else throw badRequest('요구사항에 맞지 않는 입력값'); // 맞지 않으면 에러 던짐. 그런데 else로 빼야하나?
  };

  public deleteUser = async (userId: number) => {
    // 회원 탈퇴 로직
    // TODO: 유저 검색 먼저하고 에러처리
    const userInfo = await this.authRepository.deleteUser(userId); // 유저 검색 후 없으면 에러 던져야하지 않나?

    if (!userInfo.userImage.includes('/')) deleteS3Image(userInfo.userImage); // 탈퇴한 유저의 프로필 이미지를 S3에서 삭제
  };

  public score = async (userId: number, score: number) => {
    // 점수주기 위한 로직
    const findUser = await this.authRepository.userInfo(userId); // 해당 유저 검색
    if (!findUser) throw notFound('잘못된 유저 정보이거나 탈퇴한 유저입니다.'); // 없으면 에러 던짐
    await this.authRepository.score(userId, score); // 있으면 점수 부여
  };

  public myPosts = async (userId: number, page: number) => {
    const myPosts = await this.authRepository.myPosts(userId, page);
    const result = myPosts.map((myPost: any) => {
      return {
        postId: myPost.postId,
        userId: myPost.userId,
        userName: myPost.userName,
        userImage: myPost.user.userImage.includes('http://')
          ? myPost.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${myPost.user.userImage}`,
        title: myPost.title,
        content: myPost.content,
        category: myPost.category,
        appointed: myPost.appointed,
        isDeadLine: myPost.isDeadLine,
        location1: myPost.location1,
        location2: myPost.location2,
        thumbnail:
          myPost.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? myPost.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${myPost.PostImages[0].imageUrl}`,
        tag: myPost.tag,
        createdAt: myPost.createdAt,
        updated: myPost.updated,
      };
    });
    return result;
  };
}

export default AuthService;
