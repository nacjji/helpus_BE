import { RequestHandler } from 'express';
import { Socket } from 'socket.io';

class ChatController {
  public sendChat: RequestHandler = (req, res, next) => {
    console.log(req.app);
  };
}

export default ChatController;
