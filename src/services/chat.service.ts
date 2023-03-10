import { nanoid } from 'nanoid';
import { badRequest } from '@hapi/boom';
import ChatRepository from '../repositories/chat.repository';
import prisma from '../config/database/prisma';
import { deleteS3ImageChat } from '../middlewares/multer.uploader';

class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository(prisma);
  }

  public alarmList = async (ownerId: number) => {
    const results = await this.chatRepository.alarmList(ownerId);

    const list = results.map((alarm: any) => {
      return {
        count: alarm.count,
        title: alarm.post.title,
        senderName: alarm.sender.userName,
        roomId: alarm.roomId,
      };
    });

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

  public roomInfo = async (roomId: string, userId: number) => {
    const result = await this.chatRepository.roomInfo(roomId);
    if (!result) throw badRequest('존재하지 않는 방');

    if (result.ownerId === userId) {
      const imageURL = result.sender.userImage;

      return {
        otherImage: imageURL.includes('http://')
          ? imageURL
          : `${process.env.S3_BUCKET_URL}/profile/${imageURL}`,
        otherNmae: result.sender.userName,
        appointed: result.Post.appointed,
        leave: result.leave,
      };
    }

    const imageURL = result.owner.userImage;
    return {
      otherImage: imageURL.includes('http://')
        ? imageURL
        : `${process.env.S3_BUCKET_URL}/profile/${imageURL}`,
      otherNmae: result.owner.userName,
      appointed: result.Post.appointed,
      leave: result.leave,
    };
  };

  public roomList = async (userId: number) => {
    const results = await this.chatRepository.roomList(userId);
    // eslint-disable-next-line no-underscore-dangle
    const _results = results.map((v: any) => {
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
        senderScore: v.sender.total === 0 ? 0 : v.sender.score / v.sender.total,
        ownerName: v.owner.userName,
        ownerImage: v.owner.userImage.includes('http://')
          ? v.owner.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.owner.userImage}`,
        ownerScore: v.owner.total === 0 ? 0 : v.owner.score / v.owner.total,
        leave: v.leave,
        state: v.state,
      };
    });
    return { list: _results };
  };

  public sendMessageAt = async (
    roomId: string,
    userId: number,
    content: string,
    card?: boolean
  ) => {
    const roomInfo = await this.chatRepository.searchRoomId(roomId);
    if (!roomInfo) {
      return {};
    }
    const result = await this.chatRepository.sendMessage(roomId, userId, content);

    let socketId: { socketId: string }[] = [];
    let receiverId = 0;

    if (roomInfo.ownerId === userId) {
      socketId = await this.chatRepository.searchSockets(roomInfo.senderId);
      receiverId = roomInfo.senderId;
    } else {
      socketId = await this.chatRepository.searchSockets(roomInfo.ownerId);
      receiverId = roomInfo.ownerId;
    }

    if (card) await this.chatRepository.stateUpdate(roomId, 1);

    return {
      chatId: result.chatId,
      createdAt: result.createdAt,
      side: socketId,
      postId: roomInfo.postId,
      receiverId,
    };
  };

  public acceptCard = async (roomId: string) => {
    await this.chatRepository.acceptCard(roomId);
    await this.chatRepository.stateUpdate(roomId, 2);
  };

  public readMessage = async (roomId: string, userId: number) => {
    await this.chatRepository.deleteAlarm(roomId, userId);
  };

  public deleteAllAlarm = async (userId: number) => {
    await this.chatRepository.deleteAllAlarm(userId);
  };

  public cancelCard = async (roomId: string) => {
    await this.chatRepository.stateUpdate(roomId, 0);
    await this.chatRepository.deleteCard(roomId);
  };

  public getState = async (roomId: string) => {
    const result = await this.chatRepository.roomInfo(roomId);

    if (!result) throw badRequest('해당 채팅방 없음');
    return result.state;
  };

  public createAlarm = async (
    postId: number,
    userId: number,
    receiverId: number,
    roomId: string
  ) => {
    try {
      await this.chatRepository.createAlarm(postId, receiverId, userId, roomId);
    } catch {
      await this.chatRepository.updateAlarm(postId, receiverId, userId);
    }
  };

  public readYet = async (roomId: string, ownerId: number, senderId: number) => {
    const result = await this.chatRepository.readYet(roomId, ownerId, senderId);

    return result;
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
    else {
      const chatList = await this.chatRepository.searchImage(roomId);
      deleteS3ImageChat(chatList);
      await this.chatRepository.deleteRoom(roomId);
    }
  };

  public uploadImage = async (userId: number, image: string, roomId: string) => {
    const result = await this.chatRepository.sendMessage(roomId, userId, `\`image\`${image}`);

    return result;
  };
}

export default ChatService;
