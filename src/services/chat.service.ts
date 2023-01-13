import * as shortId from 'shortid';
import ChatRepository from '../repositories/chat.repository';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  public alarmList = async (ownerId: number) => {
    const list = await this.chatRepository.alarmList(ownerId);
    console.log(list);

    return list;
  };

  public searchRoom = async (senderId: number, postId: number, ownerId: number) => {
    const result = await this.chatRepository.searchRoom(senderId, postId);

    if (result) {
      return result.roomId;
    }

    const roomId = shortId.generate();
    await this.chatRepository.createRoom(senderId, postId, roomId, ownerId);
    return roomId;
  };

  public roomList = async (userId: number) => {
    const results = await this.chatRepository.roomList(userId);

    return { list: results };
  };

  public sendMessageAt = async (roomId: string, userId: number, content: string) => {
    const roomInfo = await this.chatRepository.searchRoomId(roomId);
    if (!roomInfo) {
      return {};
    }
    const result = await this.chatRepository.sendMessage(roomId, userId, content);

    let socketId: { socketId: string }[] = [];
    let senderName = '';
    let receiverId = 0;

    if (roomInfo.ownerId === userId) {
      socketId = await this.chatRepository.searchSockets(roomInfo.senderId);
      senderName = roomInfo.Post.userName;
      receiverId = roomInfo.senderId;
    } else {
      socketId = await this.chatRepository.searchSockets(roomInfo.ownerId);
      senderName = roomInfo.sender.userName;
      receiverId = roomInfo.ownerId;
    }

    return {
      chatId: result.chatId,
      createdAt: result.createdAt,
      side: socketId,
      senderName,
      postId: roomInfo.postId,
      title: roomInfo.Post.title,
      receiverId,
    };
  };

  public readMessage = async (roomId: string) => {
    this.chatRepository.readMessage(roomId);
  };

  public isReadMessage = async (postId: number, userId: number, receiverId: number) => {
    try {
      const result = await this.chatRepository.updateAlarm(postId, receiverId, userId);
      return result.count;
    } catch {
      await this.chatRepository.createAlarm(postId, receiverId, userId);
      return 1;
    }
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
