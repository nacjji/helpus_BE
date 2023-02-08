import { badRequest } from '@hapi/boom';
import axios from 'axios'; // 카카오 서버에 요청을 보내기 위한 라이브러리
import prisma from '../config/database/prisma';
import KakaoAuthRepository from '../repositories/kakao.auth.repository';
import { makeAccessToken, makeRefreshToken } from '../modules/token.module';

const { REST_API_KEY, REDIRECT_URI, ADMIN_KEY } = process.env as {
  REST_API_KEY: string;
  REDIRECT_URI: string;
  ADMIN_KEY: string;
};

class KakaoAuthService {
  kakaoauthRepository: KakaoAuthRepository;

  constructor() {
    this.kakaoauthRepository = new KakaoAuthRepository(prisma);
  }

  public kakao = async (code: string) => {
    // 카카오 인가코드 활용해 로그인 요청 보낸 카카오 유저가 우리 db에 있는지 확인하고, 결과에 따라 동작하는 로직
    const config = {
      client_id: REST_API_KEY, // 카카오에서 내어준 우리 애플리케이션 키
      grant_type: 'authorization_code', // 로그인 및 회원가입 기능 이용하고자 하는 경우 이 값 고정
      redirect_uri: REDIRECT_URI, // 카카오 서버에 요청을 보내고 응답을 받을 url
      code, // 프론트가 발급받아 넘겨준 인가코드
    };
    const params = new URLSearchParams(config).toString(); // URLSearchParams가 객체를 받으면 그걸 그대로 params로 만들어줍니다. toString()을 활용해 문자열로 반환

    const result = await axios({
      // 요청을 axios로 보낼건데
      method: 'post', // 방식은 POST고
      url: `https://kauth.kakao.com/oauth/token?${params}`, // 지정된 url 뒤에 위에서 만들어준 params 붙여서 보냄
      headers: {
        'Content-type': 'application/json', // 헤더에는 이 내용 포함. 원래 카카오에서 추천하는 방식은 아니지만 저는 json으로 받으려고 변형했습니다
      },
    }).then((response) => {
      // 그래서 응답이 잘 오면
      return response.data; // 응답 안에 data 뽑아서
    }); // 변수 result에 담음. 여기에 카카오에서 쓸 수 있는 액세스, 리프레시 토큰 들어있음

    const { data } = await axios({
      // 다시 요청을 보낼건데
      method: 'get', // 이번에는 GET 방식이고
      url: `https://kapi.kakao.com/v2/user/me`, // 카카오에서 지정한 url에
      headers: {
        Authorization: `Bearer ${result.access_token}`, // 베어러로 방급 발급받은 액세스 토큰 전달
      },
    }); // 그래서 받은 결과 중 data를 구조분해 할당으로 받겠다
    // data안에 이미지나 이름 뭐 이런 잡다한거 들어있어요 궁금하시면 카카오 디벨로퍼에서 공식문서에 잘 나와있습니다
    // 한국사이트라 읽기도 좋음

    let isUser = await this.kakaoauthRepository.checkIsUser(data.id); // 이 유저가 우리 앱에서 사용하는 카카오 유저번호를 가지고 있는 유저인지 체크

    if (isUser && isUser.state1 && isUser.state2) {
      // 유저도 검색되고 위치정보도 확실히 있으면
      const accessToken = await makeAccessToken(
        // 토큰 발급 모듈로 토큰 발급
        isUser.userId,
        isUser.userName,
        isUser.state1,
        isUser.state2
      );

      const refreshToken = await makeRefreshToken();

      await this.kakaoauthRepository.saveToken(isUser.userId, accessToken, refreshToken); // 발급된 토큰쌍을 db에도 저장

      return {
        userid: isUser.userId,
        userName: isUser.userName,
        userImage: isUser.userImage.includes('http://') // 카카오 프로필이미지를 변경 안하고 그대로 사용하고 있으면
          ? isUser.userImage // 값 그대로 보내주고
          : `${process.env.S3_BUCKET_URL}/profile/${isUser.userImage}`, // 변경한 적 있으면 버킷주소 붙여서 보내줌
        state1: isUser.state1,
        state2: isUser.state2,
        accessToken,
        refreshToken,
      };
    }

    // 유저 정보는 있지만 위치정보가 확실하지 않은 경우도 위에서 return되지 않기 떄문에 이리 내려옴
    if (!isUser) {
      // 만약에 처음으로 로그인하려는 카카오 유저인 경우
      isUser = await this.kakaoauthRepository.registerUser(
        // 유저 정보를 등록
        data.id,
        data.properties.nickname,
        data.properties.profile_image
      );
    }

    return {
      userid: isUser.userId,
      userName: isUser.userName,
      userImage: isUser.userImage,
      state1: isUser.state1,
      state2: isUser.state2,
    };
  };

  public kakaoState = async (state1: string, state2: string, userId: number) => {
    // 카카오유저 지역 등록 로직
    // TOOD: 여기서 있는 유저인지, 있는 유저였다면 정상적으로 위치가 null인 상태에서 호출된건지 검사하는 로직 필요할듯
    const result = await this.kakaoauthRepository.kakaoState(state1, state2, userId); // 지역값 가지고 유저 등록

    const accessToken = await makeAccessToken(userId, result.userName, state1, state2); // 토큰 발급

    const refreshToken = await makeRefreshToken();

    await this.kakaoauthRepository.saveToken(userId, accessToken, refreshToken); // 토큰 db에 저장

    return {
      userId,
      userName: result.userName,
      userImage: result.userImage,
      state1,
      state2,
      accessToken,
      refreshToken,
    };
  };

  public kakaoDelete = async (userId: number) => {
    // 카카오 회원 탈퇴
    const user = await this.kakaoauthRepository.findKakaoId(userId); // 있는 유저인지 우선 확인
    if (!user) throw badRequest('해당 유저 없음'); // 없으면 에러
    if (!user.kakao) throw badRequest('카카오 유저 아님'); // 있는데 로컬유저면 에러

    const config = {
      // 또 params를 붙여서 요청 보내야해요~~
      target_id_type: 'user_id', // 카카오에서 지정해둔 필수값
      target_id: user.kakao.toString(), // 이건 우리가 등록해둔 해당 유저의 우리 앱 카카오 아이디
    };
    const params = new URLSearchParams(config).toString(); // params 위치에 붙이기만 하면 되게 바꿈

    // TODO: 사용하지 않는 변수 정의임. 삭제요망
    const result = await axios({
      // 요청을 보낼겁니다
      method: 'post', // POST 방식으로
      url: `https://kapi.kakao.com/v1/user/unlink?${params}`, // 지정 url에 만든 params 붙여서
      headers: {
        // 이것도 카카오에서 지정해준 방식
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': `KakaoAK ${ADMIN_KEY}`, // 그리고 이건 카카오 액세스토큰, 리프레시 토큰을 안 쓰기 때문에 전달해야하는 우리 앱 키값
      },
    }).then((response) => {
      return response;
    }); // 결과가 옵니다. 반환값은 탈퇴한 유저 정보가 오는 걸로 기억하는데 어차피 안쓸 정보였어서 가물가물
    await this.kakaoauthRepository.kakaeDelete(userId); // 위 과정이 정상적이라면 우리 db에서도 삭제
  };
}
export default KakaoAuthService;
