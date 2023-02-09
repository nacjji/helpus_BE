import { badRequest, notFound } from '@hapi/boom';
import prisma from '../config/database/prisma';
import ReportRepository from '../repositories/report.repository';
import PostsRepository from '../repositories/post.repository';

class ReportService {
  reportRepository: ReportRepository;

  postRepository: PostsRepository;

  constructor() {
    this.reportRepository = new ReportRepository(prisma);
    this.postRepository = new PostsRepository(prisma);
  }

  public reportUser = async (postId: number, reportNum: number, reason?: string) => {
    const findPost = await this.postRepository.findPost(postId);
    if (!findPost) throw notFound('존재하지 않는 게시글');

    if (reportNum === 4 && !reason) throw badRequest('신고 사유를 입력해 주세요');

    const reportHistory = await this.reportRepository.reportHistory(postId);

    if (reportHistory.length) {
      throw badRequest('이미 신고한 게시글');
    }

    const result = await this.reportRepository.reportPost(
      Number(postId),
      Number(reportNum),
      findPost.userId,
      reason
    );
    return result;
  };
}

export default ReportService;
