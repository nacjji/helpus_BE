import { nanoid } from 'nanoid';
import ChatRepository from '../repositories/chat.repository';
import prisma from '../config/database/prisma';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository(prisma);
  }

  public alarmList = async (ownerId: number) => {
    const list = await this.chatRepository.alarmList(ownerId);
    return list;
  };

  public searchRoom = async (senderId: number, postId: number, ownerId: number) => {
    const result = await this.chatRepository.searchRoom(senderId, postId);

    if (result) {
      return result.roomId;
    }

    const roomId = nanoid();
    await this.chatRepository.createRoom(senderId, postId, roomId, ownerId);
    return roomId;
  };

  public roomList = async (userId: number, q: number) => {
    const results = await this.chatRepository.roomList(userId, q);
    // eslint-disable-next-line no-underscore-dangle
    const _results = results.map((v) => {
      return {
        roomId: v.roomId,
        ownerId: v.ownerId,
        senderId: v.senderId,
        postId: v.postId,
        title: v.Post.title,
        appointed: v.Post.appointed,
        senderName: v.sender.userName,
        senderImage: v.sender.userImage.includes('http://')
          ? v.sender.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.sender.userImage}`,
        ownerName: v.owner.userName,
        ownerImage: v.owner.userImage.includes('http://')
          ? v.owner.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.owner.userImage}`,
        leave: v.leave,
      };
    });
    return { list: _results };
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

  public acceptCard = async (roomId: string) => {
    await this.chatRepository.acceptCard(roomId);
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

  public leaveRoom = async (userId: number, roomId: string, leave: number) => {
    if (!leave) await this.chatRepository.leaveRoom(userId, roomId);
    else await this.chatRepository.deleteRoom(roomId);
  };
}

export default ChatService;
