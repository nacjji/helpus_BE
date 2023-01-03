import { badRequest } from '@hapi/boom';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import KakaoAuthRepository from '../repositories/kakao.auth.repository';

const { REST_API_KEY, REDIRECT_URI, ADMIN_KEY, JWT_SECRET_KEY } = process.env as {
  REST_API_KEY: string;
  REDIRECT_URI: string;
  ADMIN_KEY: string;
  JWT_SECRET_KEY: string;
};

class KakaoAuthService {
  kakaoauthRepository: KakaoAuthRepository;

  constructor() {
    this.kakaoauthRepository = new KakaoAuthRepository();
  }

  kakao = async (code: string) => {
    const config = {
      client_id: REST_API_KEY,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    };
    const params = new URLSearchParams(config).toString();

    const result = await axios({
      method: 'post',
      url: `https://kauth.kakao.com/oauth/token?${params}`,
      headers: {
        'Content-type': 'application/json',
      },
    }).then((response) => {
      return response.data;
    });

    const { data } = await axios({
      method: 'get',
      url: `https://kapi.kakao.com/v2/user/me`,
      headers: {
        Authorization: `Bearer ${result.access_token}`,
      },
    });

    let isUser = await this.kakaoauthRepository.checkIsUser(data.id);

    let token = '';
    if (isUser && isUser.state1) {
      token = jwt.sign({ userId: isUser.userId, userName: isUser.userName }, JWT_SECRET_KEY, {
        expiresIn: '2h',
      });
    }

    if (!isUser) {
      isUser = await this.kakaoauthRepository.registerUser(
        data.id,
        data.properties.nickname,
        data.properties.profile_image
      );
    }

    return {
      userid: isUser.userId,
      userName: isUser.userName,
      profileImage: isUser.userImage,
      token,
    };
  };

  public kakaoState = async (state1: string, state2: string, userId: number) => {
    const result = await this.kakaoauthRepository.kakaoState(state1, state2, userId);

    const token = jwt.sign({ userId: result.userId, userName: result.userName }, JWT_SECRET_KEY, {
      expiresIn: '2h',
    });

    return {
      userId: result.userId,
      userName: result.userName,
      userImage: result.userImage,
      token,
    };
  };

  public kakaoDelete = async (userId: number) => {
    const user = await this.kakaoauthRepository.findKakaoId(userId);
    if (!user) throw badRequest('해당 유저 없음');
    if (!user.kakao) throw badRequest('카카오 유저 아님');

    const config = {
      target_id_type: 'user_id',
      target_id: user.kakao.toString(),
    };
    const params = new URLSearchParams(config).toString();

    const result = await axios({
      method: 'post',
      url: `https://kapi.kakao.com/v1/user/unlink?${params}`,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': `KakaoAK ${ADMIN_KEY}`,
      },
    }).then((response) => {
      return response;
    });
    await this.kakaoauthRepository.kakaeDelete(userId);
  };
}
export default KakaoAuthService;
