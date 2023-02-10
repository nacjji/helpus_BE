import { badRequest, notFound } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class ReportRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  // 지금은 사용하지 않는 코드이기는 하나, 서비스에서 할 일을 레포지토리에서 하고 있네요!
  // eslint-disable-next-line class-methods-use-this
  public reportUser = async (postId: number, reportNum: number, reason?: string) => {
    // 이전에 같은 내용으로 신고한 내역이 있는지 확인
    const reportHistory = await this.prisma.report.findMany({
      where: { AND: [{ postId }, { reportNum }] },
    });
    // 게시글이 존재하는지 확인하고 없을 경우 404 에러 반환
    const existPost = await this.prisma.post.findUnique({ where: { postId } }); // 확인을 먼저하고 신고내역 조회가 로직상 맞을 것 같아요
    if (!existPost) {
      throw notFound('존재하지 않는 게시글');
    }
    // 신고한 게시글의 userId
    const { userId } = existPost;
    if (reportHistory.length) {
      throw badRequest('이미 같은 내용으로 신고한 게시글'); // 이것도 userId 뽑아내기 전에!
    }
    await this.prisma.report.create({
      data: {
        userId,
        postId,
        reportNum,
        reason,
      },
    });
    return reportHistory; // 이건 왜 반환하는건가요?
  };
}
export default ReportRepository;
