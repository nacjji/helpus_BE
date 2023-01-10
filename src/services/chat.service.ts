import * as shortId from 'shortid';
import ChatRepository from '../repositories/chat.repository';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  // userId, postId 를 받아 랜덤화된 roomId 를 반환시키는 메소드
  public searchRoom = async (userId: number, postId: number) => {
    // 배열 내 객체로 들어오는 결과를 배열이 아닌 객체로 변수 선언
    const [result] = await this.chatRepository.searchRoom(userId, postId);
    // userId와 postId 를 조합해 랜덤화된 roomId 를 만든다.
    // userId와 postId 이미 채팅중이라면(db에 이미 존재하는 roomId라면) db에 있는 roomId를 그대로 반환
    // 예를 들어 1번 유저가 1번 게시글에 채팅을 신청하면 1과 1을 조합해 랜덤화시킴
    // 랜덤화 시킨 roomId 가 db에 저장되고, 다시 해당 유저가 문의하기 버튼을 누르면 1과 1이 조합된 roomId를 다시 불러와 채팅을 재개한다.
    if (result) {
      return result.roomId;
    }
    return shortId.generate();
  };

  public sendMessageAt = async (
    userId: number,
    postId: number,
    roomId: string,
    content: string
  ) => {
    // result 에는 chat.repository.ts 의 sendMessage 결과값이 담긴다. (userId, postId, roomId, content, createdAt(default, now()))
    const result = await this.chatRepository.sendMessage(userId, postId, roomId, content);
    // createdAt을 결과로 반환
    // service 단에서 sendMessage의 결과로 작성시간을 반환한다.

    return result.createdAt;
  };

  public chatHistory = async (roomId: string) => {
    const result = await this.chatRepository.chatHistory(roomId);

    return result;
  };
}

export default ChatService;
