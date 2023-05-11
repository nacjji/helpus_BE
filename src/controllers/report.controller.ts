import { RequestHandler } from 'express';
import ReportService from '../services/report.service';

class ReportController {
  reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public reportUser: RequestHandler = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { reportNum, reason } = req.body;

      await this.reportService.reportUser(Number(postId), Number(reportNum), reason);
      return res.status(201).json({ message: '게시글을 신고했습니다.' });
    } catch (err) {
      return next(err);
    }
  };
}

export default ReportController;
