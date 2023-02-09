// TODO: 생성할 때 서비스단에서 db 설정 넘겨주는데 import가 필요할까?
import { PrismaClient } from '@prisma/client';

class AuthRepository {
  prisma: PrismaClient; // db 접근을 위한 내부 변수

  constructor(prisma: any) {
    this.prisma = prisma; // db설정을 넘겨받으며 생성
  }

  public saveToken = async (userId: number, accessToken: string, refreshToken: string) => {
    // 토큰 저장
    await this.prisma.token.create({
      data: { userId, accessToken, refreshToken },
    });
  };

  public emailCheck = async (email: string) => {
    // 있는 이메일인지 확인
    const check = await this.prisma.user.findUnique({
      where: { email },
    });

    return check;
  };

  public createUser = async (
    // 유저 생성
    email: string,
    userName: string,
    password: string,
    state1: string,
    state2: string,
    profileImage: string
  ) => {
    // TODO: 불필요한 변수 사용 삭제
    const result = await this.prisma.user.create({
      data: { email, userName, password, state1, state2, userImage: profileImage },
    });
    return result; // 굳이 반환 안해줘도 될듯
  };

  public userInfo = async (userId: number) => {
    // userId로 사용자 검색
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: { Report: true },
    });
    return user;
  };

  public wishlist = async (userId: number, q: number) => {
    // userId로 q에 해당하는 게시글 검색
    const results = await this.prisma.wish.findMany({
      where: { userId },
      include: {
        post: {
          // wish 테이블에 관계 설정된 post에서
          include: {
            user: { select: { userImage: true, userName: true } }, // 다시 post랑 관계된 user에서 필요한 일부 정보
            PostImages: { select: { imageUrl: true } }, // post랑 관계된 postImage
          },
        },
      },
      skip: q || 0, // 개수만큼 건너뜀. 없으면 처음부터
      take: 6, // 이만큼의 개수만 가져옴
      // TODO: 최신 게시글순으로 정렬하는게 맞을지? 아님 내가 찜 누른 최신순으로 정렬하는게 맞을지? 논의 필요한 내용
      orderBy: { postId: 'desc' }, // 최신 게시글 순으로
    });
    return results;
  };

  public updateUser = async (userId: number, userName: string, state1: string, state2: string) => {
    // 유저 정보 변경
    await this.prisma.user.update({
      where: { userId },
      data: {
        userName,
        state1,
        state2,
      },
    });
  };

  public updateImage = async (userId: number, userImage: string) => {
    // 유저 이미지 변경
    // TODO: 서비스단에서 반환값 없음. result는 불필요한 변수임
    const result = await this.prisma.user.update({
      where: { userId },
      data: { userImage },
    });

    return result;
  };

  // TODO: 이 메소드가 필요할까? 유저 정보 가져오는 메소드에서 뽑아써도 될듯. 조정필요
  public searchPassword = async (userId: number) => {
    // 비밀번호 조회
    const password = await this.prisma.user.findUnique({
      where: { userId },
      select: { password: true },
    });

    return password;
  };

  public updatePassword = async (userId: number, password: string) => {
    // 비밀번호 변경
    await this.prisma.user.update({
      where: { userId },
      data: { password },
    });
  };

  public deleteUser = async (userId: number) => {
    // 유저 삭제
    const result = await this.prisma.user.delete({
      where: { userId },
    });

    return result;
  };

  public isKakao = async (userId: number) => {
    // 카카오 유저인지 확인
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { kakao: true },
    });

    return user;
  };

  public score = async (userId: number, score: number) => {
    // 점수 부여
    const scoreRate = await this.prisma.user.update({
      where: { userId },
      data: { score: { increment: score }, score_total: { increment: 1 } },
    });
    return scoreRate.score / scoreRate.score_total; // 이 계산을 여기서 하는게 맞는지는 약간 의문
  };

  public myPosts = async (userId: number, q: number) => {
    // 내 게시글 목록 조회
    const myPosts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        // TODO: userImage 가져오는건 빼도 좋을듯
        user: { select: { userImage: true } }, // 내 이미지는 프론트가 가지고 있을텐데 굳이 들어가야 할까? 한 번만 사용할 데이터가 모든 객체에 들어갈텐데
        PostImages: { select: { imageUrl: true } }, // PostImage로 썸네일 가져옴
      },
      skip: page || 0,
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    return myPosts;
  };
}

export default AuthRepository;
