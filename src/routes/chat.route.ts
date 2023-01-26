import { Router } from 'express';
import { chatUploader } from '../middlewares/multer.uploader';
import ChatController from '../controllers/chat.controller';
import * as auth from '../middlewares/auth.middleware';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/alarm', auth.requiredLogin, chatController.alarmList);
chatRouter.get('/list', auth.requiredLogin, chatController.roomList);
chatRouter.post('/image', chatUploader.single('image'), chatController.uploadImage);

export default chatRouter;
