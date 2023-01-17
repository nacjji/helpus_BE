import { badRequest, notFound } from '@hapi/boom';
import { PrismaClient } from '@prisma/client';

class ReportRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  // eslint-disable-next-line class-methods-use-this
  public reportUser = async (postId: number, reportNum: number, reason?: string) => {
    // 이전에 같은 내용으로 신고한 내역이 있는지 확인
    const reportHistory = await this.prisma.report.findMany({
      where: { AND: [{ postId }, { reportNum }] },
    });
    // 게시글이 존재하는지 확인하고 없을 경우 404 에러 반환
    const existPost = await this.prisma.post.findUnique({ where: { postId } });
    if (!existPost) {
      throw notFound('존재하지 않는 게시글');
    }
    // 신고한 게시글의 userId
    const { userId } = existPost;
    if (reportHistory.length) {
      throw badRequest('이미 같은 내용으로 신고한 게시글');
    }
    await this.prisma.report.create({
      data: {
        userId,
        postId,
        reportNum,
        reason,
      },
    });
    return reportHistory;
  };
}
export default ReportRepository;
