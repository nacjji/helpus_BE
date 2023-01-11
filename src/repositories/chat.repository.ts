import { PrismaClient } from '@prisma/client';

class ChatRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public searchRoom = async (senderId: number, postId: number) => {
    const [result] = await this.prisma.room.findMany({
      where: { senderId, postId },
    });

    return result;
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

  // repository 단에서 Chat 테이블에 채팅 내역을 한줄씩 저장한다.
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
    });
    return result;
  };
}

export default ChatRepository;
