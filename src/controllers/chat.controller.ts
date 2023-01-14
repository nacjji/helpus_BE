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
      const { userId } = res.locals;
      const results = await this.chatService.roomList(userId);

      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };
}

export default ChatController;
