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
}

export default ChatRepository;
