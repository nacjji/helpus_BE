import { PrismaClient } from '@prisma/client';

class ChatRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public searchRoom = async (userId: number, postId: number) => {
    const result = await this.prisma.chat.findMany({
      where: { userId, postId },
    });

    return result;
  };

  public sendMessage = async (userId: number, postId: number, roomId: string, content: string) => {
    const result = await this.prisma.chat.create({
      data: {
        userId,
        postId,
        roomId,
        content,
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

  public deleteSocket = async (socketId: string) => {
    await this.prisma.socketTable.delete({
      where: { socketId },
    });
  };

  public chatHistory = async (roomId: string) => {
    const result = await this.prisma.chat.findMany({
      where: { roomId },
      select: { content: true, userId: true, createdAt: true },
    });

    return result;
  };
}

export default ChatRepository;
