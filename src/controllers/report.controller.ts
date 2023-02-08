import { RequestHandler } from 'express';
import ReportService from '../services/report.service';

class ReportController {
  reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  // eslint-disable-next-line class-methods-use-this
  public reportUser: RequestHandler = async (req, res, next) => {
    try {
      // 신고할 게시글
      const { postId } = req.params;
      // reportNum : 객관식 신고 번호, reason : 신고사유
      const { reportNum, reason } = req.body;

      await this.reportService.reportUser(Number(postId), Number(reportNum), reason);
      return res.status(201).json({ message: '게시글을 신고했습니다.' });
    } catch (err) {
      return next(err);
    }
  };
}

export default ReportController;
