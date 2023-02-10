import { RequestHandler } from 'express';
import ReportService from '../services/report.service';

class ReportController {
  reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  // 이 주석 없어도 될 것 같아요! 아래에서 this를 쓰고 있기 때문에 빨간 줄 안뜰거예요~
  // eslint-disable-next-line class-methods-use-this
  public reportUser: RequestHandler = async (req, res, next) => {
    // 유저 신고 함수
    try {
      const { postId } = req.params;
      const { reportNum, reason } = req.body;
      await this.reportService.reportUser(Number(postId), Number(reportNum), reason); // reportNum은 형변환 없어도 괜찮을 것 같습니다
      return res.status(201).json({ message: '게시글을 신고했습니다.' });
    } catch (err) {
      return next(err);
    }
  };
}

export default ReportController;
