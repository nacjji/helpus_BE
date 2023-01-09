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
}

export default ChatRepository;
