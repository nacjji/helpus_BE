import prisma from '../config/database/prisma';
import ReportRepository from '../repositories/report.repository';

class ReportService {
  reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository(prisma);
  }

  public reportUser = async (postId: number, reportNum: number, reason?: string) => {
    // 신고 로직
    const result = await this.reportRepository.reportUser(
      Number(postId), // 받을 때 형을 지정해서 옵니당 ㅎㅎ
      Number(reportNum),
      reason
    );
    return result; // 여기 반환은 있는데, 컨트롤러에서 활용은 하지 않더라구요
  };
}

export default ReportService;
