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

  public roomList = async (userId: number, q: number) => {
    const results = await this.chatRepository.roomList(userId, q);
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
        ownerName: v.owner.userName,
        ownerImage: v.owner.userImage.includes('http://')
          ? v.owner.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.owner.userImage}`,
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

    if (card) await this.chatRepository.stateUpdate(roomId, 1);

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
    await this.chatRepository.stateUpdate(roomId, 2);
  };

  public readMessage = async (roomId: string) => {
    this.chatRepository.readMessage(roomId);
  };

  public cancelCard = async (roomId: string) => {
    await this.chatRepository.stateUpdate(roomId, 0);
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
