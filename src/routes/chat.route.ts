import { Router } from 'express';
import ChatController from '../controllers/chat.controller';
import * as auth from '../middlewares/auth.middleware';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/alarm', auth.requiredLogin, chatController.alarmList);
chatRouter.get('/list', auth.requiredLogin, chatController.roomList);

export default chatRouter;
