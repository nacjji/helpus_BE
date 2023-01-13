import { Router } from 'express';
import ChatController from '../controllers/chat.controller';

const chatRouter = Router();
const chatController = new ChatController();

<<<<<<< Updated upstream
chatRouter.get('/enter', chatController.enterChatRoom);
=======
chatRouter.get('/alarm', auth.requiredLogin, chatController.alarmList);
chatRouter.get('/list', auth.requiredLogin, chatController.roomList);
>>>>>>> Stashed changes

export default chatRouter;
