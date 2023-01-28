import { Router } from 'express';
import { chatUploader } from '../middlewares/multer.uploader';
import ChatController from '../controllers/chat.controller';
import * as auth from '../middlewares/auth.middleware';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/alarm', auth.requiredLogin, chatController.alarmList);
chatRouter.get('/list', auth.requiredLogin, chatController.roomList);
chatRouter.post(
  '/image',
  auth.requiredLogin,
  chatUploader.single('image'),
  chatController.uploadImage
);
chatRouter.get('/info', auth.requiredLogin, chatController.roomInfo);

chatRouter.get('/test', chatController.test);

export default chatRouter;
