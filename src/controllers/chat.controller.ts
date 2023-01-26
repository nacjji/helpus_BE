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

      const content = await this.chatService.uploadImage(Number(userId), image, roomId);
      res.status(201).json({ content });
    } catch (err) {
      next(err);
    }
  };
}

export default ChatController;
