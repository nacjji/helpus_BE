import * as shortId from 'shortid';
import ChatRepository from '../repositories/chat.repository';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  public searchRoom = async (senderId: number, postId: number, ownerId: number) => {
    const result = await this.chatRepository.searchRoom(senderId, postId);

    if (result) {
      return result.roomId;
    }

    const roomId = shortId.generate();
    await this.chatRepository.createRoom(senderId, postId, roomId, ownerId);
    return roomId;
  };

  public sendMessageAt = async (roomId: string, userId: number, content: string) => {
    const result = await this.chatRepository.sendMessage(roomId, userId, content);

    return result.createdAt;
  };

  public saveSocket = async (userId: number, socketId: string) => {
    const result = await this.chatRepository.searchSocket(socketId);

    if (!result) await this.chatRepository.saveSocket(userId, socketId);
  };

  public deleteSocket = async (socketId: string) => {
    const result = await this.chatRepository.searchSocket(socketId);

    if (result) await this.chatRepository.deleteSocket(socketId);
  };

  public chatHistory = async (roomId: string) => {
    const result = await this.chatRepository.chatHistory(roomId);

    return result;
  };
}

export default ChatService;
