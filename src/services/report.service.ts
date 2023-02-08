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
    // params 로 받은 게시글이 존재하는지 확인
    const findPost = await this.postRepository.findPost(postId);
    if (!findPost) throw notFound('존재하지 않는 게시글');

    // 신고 번호 4(기타)번을 선택했는데 사유를 입력안하면 에러
    if (reportNum === 4 && !reason) throw badRequest('신고 사유를 입력해 주세요');
    // 신고 내역이 있는지 확인
    const reportHistory = await this.reportRepository.reportHistory(postId);
    // 신고 내역이 있으면 에러 반환
    if (reportHistory.length) {
      throw badRequest('이미 신고한 게시글');
    }
    // 신고를 실제 수행하는 reportPost로 전달
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
