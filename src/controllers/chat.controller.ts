import { RequestHandler } from 'express';
import chatRouter from 'routes/chat.route';

class ChatController {
  public enterChatRoom: RequestHandler = (req, res, next) => {
    const { userId } = req.body;

    const io = req.app.get('io');
    res.send(200);
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
