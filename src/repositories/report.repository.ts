import { PrismaClient } from '@prisma/client';

class ReportRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public reportHistory = async (postId: number) => {
    const reportHistory = await this.prisma.report.findMany({
      where: { postId },
    });
    return reportHistory;
  };

  public reportPost = async (
    postId: number,
    reportNum: number,
    userId: number,
    reason?: string
  ) => {
    await this.prisma.report.create({
      data: {
        userId,
        postId,
        reportNum,
        reason,
      },
    });
  };
}
export default ReportRepository;
