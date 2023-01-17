import { badRequest } from '@hapi/boom';
import prisma from '../config/database/prisma';
import ReportRepository from '../repositories/report.repository';

class ReportService {
  reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository(prisma);
  }

  public reportUser = async (postId: number, reportNum: number, reason?: string) => {
    const result = await this.reportRepository.reportUser(
      Number(postId),
      Number(reportNum),
      reason
    );
    return result;
  };
}

export default ReportService;
