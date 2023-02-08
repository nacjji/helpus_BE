import { Router } from 'express';
import { chatUploader } from '../middlewares/multer.uploader';
import { ChatController, chatImage } from '../controllers/chat.controller';
import * as auth from '../middlewares/auth.middleware';

const chatRouter = Router();
const chatController = new ChatController();

chatRouter.get('/alarm', auth.requiredLogin, chatController.alarmList); // 알람 목록 조회
chatRouter.get('/list', auth.requiredLogin, chatController.roomList); // 채팅방 목록 조회
chatRouter.post('/image', auth.requiredLogin, chatUploader.single('image'), chatImage); // 채팅 이미지 전송
chatRouter.get('/info', auth.requiredLogin, chatController.roomInfo); // 채팅방 정보 조회
// TODO: 굳이 post로 데이터를 body에 담아야 했나? 내가 수정하면 프론트도 수정해야하니 넘어가지만 RESTful하지 않은 느낌
chatRouter.post('/state', auth.requiredLogin, chatController.getState); // 채팅방 state 조회

export default chatRouter;
