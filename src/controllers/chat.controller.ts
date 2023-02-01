import { RequestHandler } from 'express';
import ChatService from '../services/chat.service';

const chatImage: RequestHandler = (req, res, next) => {
  try {
    const { location: image } = req.file as Express.MulterS3.File;
    res.status(201).json({ content: `\`image\`${image}` });
  } catch (err) {
    next(err);
  }
};

class ChatController {
  private chatService;

  constructor() {
    this.chatService = new ChatService();
  }

  public test: RequestHandler = async (req, res, next) => {
    try {
      const { userId, roomId, leave } = req.body;
      await this.chatService.leaveRoom(userId, roomId, leave);

      res.status(200).json({});
    } catch (err) {
      next(err);
    }
  };

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
      // const q = Number(req.query.q);
      // const { userId } = res.locals;
      // const results = await this.chatService.roomList(userId, q);

      res.status(200).json({ message: 'please...... ' });
    } catch (err) {
      next(err);
    }
  };

  public roomInfo: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const { roomId } = req.body;
      const result = await this.chatService.roomInfo(roomId, userId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

export { ChatController, chatImage };
