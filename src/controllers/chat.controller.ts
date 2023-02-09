import { RequestHandler } from 'express';
import ChatService from '../services/chat.service';

const chatImage: RequestHandler = (req, res, next) => {
  // 채팅방에 보낸 이미지 S3에 저장
  try {
    // 서비스단에 갈 로직이 없어 밖에 따로 작성함
    // TODO: ?서비스단에 넣을 수 있는 방법이 있을것 같은데 나만 수정해도 되는 방향이면 해보자
    const { location: image } = req.file as Express.MulterS3.File; // 이미지 url 받아서
    res.status(201).json({ content: `\`image\`${image}` }); // 약속어인 `image` 붙여서 반환
  } catch (err) {
    next(err);
  }
};

class ChatController {
  private chatService;

  constructor() {
    this.chatService = new ChatService();
  }

  public alarmList: RequestHandler = async (req, res, next) => {
    // 알람 목록 조회를 위한 함수
    try {
      const { userId } = res.locals;
      const list = await this.chatService.alarmList(userId); // 유저에게 해당하는 알람 목록을 llist에 담음

      res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  };

  public deleteAllAlarm: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      await this.chatService.deleteAllAlarm(userId);

      res.status(200).json({ message: '알람 삭제 완료' });
    } catch (err) {
      next(err);
    }
  };

  public roomList: RequestHandler = async (req, res, next) => {
    // 채팅방 목록 조회를 위한 함수
    try {
      const { userId } = res.locals;
      const results = await this.chatService.roomList(userId);

      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  public roomInfo: RequestHandler = async (req, res, next) => {
    // 특정 방 정보 조회
    try {
      const { userId } = res.locals;
      const { roomId } = req.body;
      const result = await this.chatService.roomInfo(roomId, userId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  public getState: RequestHandler = async (req, res, next) => {
    // 특정 방 state 조회
    try {
      const { roomId } = req.body;
      const state = await this.chatService.getState(roomId);

      res.status(200).json(state);
    } catch (err) {
      next(err);
    }
  };
}

export { ChatController, chatImage };
