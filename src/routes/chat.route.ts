import { Router } from 'express';
import ChatController from '../controllers/chat.controller';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/enter', chatController.enterChatRoom);

export default chatRouter;
