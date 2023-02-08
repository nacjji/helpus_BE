// TODO: 서비스단에서 넘겨받음. 필요없는 import
import { PrismaClient } from '@prisma/client';

class KakaoAuthRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public checkIsUser = async (kakao: number) => {
    // 카카오 로그인이 처음인지 아닌지 확인
    const user = await this.prisma.user.findUnique({
      where: { kakao }, // 카카오 아이디값으로 검색
    });

    return user;
  };

  public registerUser = async (kakao: number, userName: string, userImage: string) => {
    // 카카오 유저 등록
    const user = await this.prisma.user.create({
      data: {
        kakao,
        userName,
        userImage,
      },
    });

    return user;
  };

  public kakaoState = async (state1: string, state2: string, userId: number) => {
    // 지역 정보 설정
    const user = await this.prisma.user.update({
      where: { userId },
      data: { state1, state2 },
    });

    return user;
  };

  public findKakaoId = async (userId: number) => {
    // 유저아이디로 카카오 아이디값 조회
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    return user;
  };

  public kakaeDelete = async (userId: number) => {
    // 회원 삭제
    await this.prisma.user.delete({
      where: { userId },
    });
  };

  public saveToken = async (userId: number, accessToken: string, refreshToken: string) => {
    // 토큰쌍 등록
    // TODO: ?이.. 토큰 저장하는 함수가 auth에도 있고 여기에도 있는데 이게 맞나.. 물론 한두줄짜리 함수라 크게 문제될건 아니지만...
    await this.prisma.token.create({
      data: { userId, accessToken, refreshToken },
    });
  };
}

export default KakaoAuthRepository;
