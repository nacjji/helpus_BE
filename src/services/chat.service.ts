import * as shortId from 'shortid';
import ChatRepository from '../repositories/chat.repository';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  public searchRoom = async (userId: number, postId: number) => {
    const [result] = await this.chatRepository.searchRoom(userId, postId);

    if (result) return result.roomId;
    return shortId.generate();
  };

  public sendMessage = async (userId: number, postId: number, roomId: string, content: string) => {
    const result = await this.chatRepository.sendMessage(userId, postId, roomId, content);

    return result.createdAt;
  };

  public saveSocket = async (userId: number, socketId: string) => {
    const result = await this.chatRepository.searchSocket(socketId);

    if (!result) await this.chatRepository.saveSocket(userId, socketId);
  };

  public deleteSocket = async (socketId: string) => {
    await this.chatRepository.deleteSocket(socketId);
  };
}

export default ChatService;
