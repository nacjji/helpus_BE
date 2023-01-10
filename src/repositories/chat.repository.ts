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

  // repository 단에서 Chat 테이블에 채팅 내역을 한줄씩 저장한다.
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

  public chatHistory = async (roomId: string) => {
    const result = await this.prisma.chat.findMany({
      where: { roomId },
      select: { content: true, userId: true, createdAt: true },
    });

    return result;
  };
}

export default ChatRepository;
