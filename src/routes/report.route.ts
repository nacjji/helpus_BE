import { Router } from 'express';

import ReportController from '../controllers/report.controller';
import { requiredLogin } from '../middlewares/auth.middleware';

const reportRouter = Router();
const reportController = new ReportController();

reportRouter.post('/:postId', requiredLogin, reportController.reportUser);

export default reportRouter;
