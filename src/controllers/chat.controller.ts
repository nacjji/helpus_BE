import { RequestHandler } from 'express';
import chatRouter from 'routes/chat.route';

class ChatController {
  public enterChatRoom: RequestHandler = (req, res, next) => {
    const { userId } = req.body;

    const io = req.app.get('io');
    res.send(200);
  };
}

export default ChatController;
