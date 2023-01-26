import { RequestHandler } from 'express';
import ChatService from '../services/chat.service';

class ChatController {
  private chatService;

  constructor() {
    this.chatService = new ChatService();
  }

  public alarmList: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const results = await this.chatService.alarmList(userId);

      res.status(200).json({ list: results });
    } catch (err) {
      next(err);
    }
  };

  public roomList: RequestHandler = async (req, res, next) => {
    try {
      const q = Number(req.query.q);
      const { userId } = res.locals;
      const results = await this.chatService.roomList(userId, q);

      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  public uploadImage: RequestHandler = async (req, res, next) => {
    try {
      const { roomId, userId } = req.body;
      const { location: image } = req.file as Express.MulterS3.File;

      await this.chatService.uploadImage(userId, image, roomId);
      res.json(201).json({ message: '이미지 전송 완료', url: image });
    } catch (err) {
      next(err);
    }
  };
}

export default ChatController;
