import { PrismaClient } from '@prisma/client';
import { number } from 'joi';

class ChatRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public alarmList = async (ownerId: number) => {
    const results = await this.prisma.alarm.findMany({
      where: { ownerId, NOT: { count: 0 } },
      include: { post: true, sender: true },
    });

    return results;
  };

  public searchRoom = async (senderId: number, postId: number) => {
    const [result] = await this.prisma.room.findMany({
      where: { senderId, postId },
    });

    return result;
  };

  public roomList = async (userId: number, q: number) => {
    const results = await this.prisma.room.findMany({
      where: {
        OR: [{ ownerId: userId }, { senderId: userId }],
        AND: { NOT: { leave: userId } },
      },
      include: {
        Post: { select: { title: true, appointed: true } },
        sender: { select: { userName: true, userImage: true } },
        owner: { select: { userName: true, userImage: true } },
      },
      skip: q || 0,
      take: 6,
      orderBy: { roomId: 'desc' },
    });

    return results;
  };

  public createRoom = async (senderId: number, postId: number, roomId: string, ownerId: number) => {
    await this.prisma.room.create({
      data: {
        senderId,
        postId,
        roomId,
        ownerId,
      },
    });
  };

  public leaveRoom = async (userId: number, roomId: string) => {
    await this.prisma.room.update({
      where: { roomId },
      data: { leave: userId },
    });
  };

  public deleteRoom = async (roomId: string) => {
    await this.prisma.room.delete({
      where: { roomId },
    });
  };

  public searchRoomId = async (roomId: string) => {
    const result = await this.prisma.room.findUnique({
      where: { roomId },
      include: { Post: true, sender: true },
    });

    return result;
  };

  public sendMessage = async (roomId: string, userId: number, content: string) => {
    const result = await this.prisma.chat.create({
      data: {
        roomId,
        userId,
        content,
      },
    });

    return result;
  };

  public acceptCard = async (roomId: string) => {
    await this.prisma.chat.updateMany({
      where: { roomId, content: '`card`0' },
      data: { content: '`card`1' },
    });
  };

  public readMessage = async (roomId: string) => {
    await this.prisma.chat.updateMany({
      where: { roomId, isRead: 0 },
      data: { isRead: 1 },
    });
  };

  public isReadMessage = async (chatId: number) => {
    const result = await this.prisma.chat.findUnique({
      where: { chatId },
    });

    return result;
  };

  public isNew = async (postId: number, userId: number) => {
    const [result] = await this.prisma.alarm.findMany({
      where: { postId, senderId: userId },
    });

    return result;
  };

  public createAlarm = async (postId: number, ownerId: number, senderId: number) => {
    await this.prisma.alarm.create({
      data: { postId, ownerId, senderId },
    });
  };

  public updateAlarm = async (postId: number, ownerId: number, senderId: number) => {
    const result = await this.prisma.alarm.updateMany({
      where: {
        postId,
        ownerId,
        senderId,
      },
      data: {
        count: { increment: 1 },
      },
    });

    return result;
  };

  public saveSocket = async (userId: number, socketId: string) => {
    await this.prisma.socketTable.create({
      data: {
        userId,
        socketId,
      },
    });
  };

  public searchSocket = async (socketId: string) => {
    const result = await this.prisma.socketTable.findUnique({
      where: { socketId },
    });

    return result;
  };

  public searchSockets = async (userId: number) => {
    const results = await this.prisma.socketTable.findMany({
      where: { userId },
      select: { socketId: true },
    });

    return results;
  };

  public deleteSocket = async (socketId: string) => {
    await this.prisma.socketTable.delete({
      where: { socketId },
    });
  };

  public chatHistory = async (roomId: string) => {
    const result = await this.prisma.chat.findMany({
      where: { roomId },
    });
    return result;
  };
}

export default ChatRepository;
