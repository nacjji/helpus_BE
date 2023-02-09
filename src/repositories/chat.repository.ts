import { PrismaClient } from '@prisma/client';
import { number } from 'joi'; // TODO: 이거 왜 들어갔지? 삭제해야함

class ChatRepository {
  prisma: PrismaClient;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  public alarmList = async (ownerId: number) => {
    const results = await this.prisma.alarm.findMany({
      // 알람 목록
      where: { ownerId },
      include: { post: true, sender: true }, // 제목과 보낸사람 닉네임을 위해 관계까지 다 가져옴
    });

    return results;
  };

  public searchRoom = async (senderId: number, postId: number) => {
    // 특정 방 찾기
    const [result] = await this.prisma.room.findMany({
      // TODO: 키값으로 찾는게 아니라 findMany 써놓고 배열 벗겼는데, findFirst 쓰면 될듯
      where: { senderId, postId },
    });

    return result;
  };

  public roomInfo = async (roomId: string) => {
    // 특정 방 정보 조회
    const result = await this.prisma.room.findUnique({
      where: { roomId },
      include: { Post: true, sender: true, owner: true }, // 어떤 유저가 상대방인지 여기선 판단 불가능. 모든 관계 함께 반환함
    });

    return result;
  };

  public roomList = async (userId: number, q: number) => {
    // 채팅방 목록 조회
    // TODO: ?NOT으로 상대방만 가져올수 있지 않을까?
    const results = await this.prisma.room.findMany({
      where: {
        OR: [{ ownerId: userId }, { senderId: userId }], // 보내든 받든 요청한 유저가 포함되어야 하지만
        AND: { NOT: { leave: userId } }, // 그 유저가 나간 방이면 안 됨
      },
      include: {
        Post: { select: { title: true, appointed: true } },
        sender: { select: { userName: true, userImage: true } },
        owner: { select: { userName: true, userImage: true } }, // 어떤 유저가 상대방인지 판단은 서비스단에서. 여기서는 일단 모든 정보 가져옴
      },
      orderBy: { roomId: 'desc' },
    });

    return results;
  };

  public createRoom = async (senderId: number, postId: number, roomId: string, ownerId: number) => {
    // 새 채팅방 생성
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
    // 요청한 유저의 방 나가기 처리
    await this.prisma.room.update({
      where: { roomId },
      data: { leave: userId },
    });
  };

  public deleteRoom = async (roomId: string) => {
    // 해당 채팅방 삭제 처리
    await this.prisma.room.delete({
      where: { roomId },
    });
  };

  public searchRoomId = async (roomId: string) => {
    // 특정 방 조회
    const result = await this.prisma.room.findUnique({
      where: { roomId },
      include: { Post: true, sender: true },
    });

    return result;
  };

  public searchImage = async (roomId: string) => {
    // 해당 방의 모든 이미지 검색
    const results = await this.prisma.chat.findMany({
      where: { AND: [{ roomId }, { content: { startsWith: '`image`' } }] },
      select: { content: true }, // 서비스단에서 처리하기 쉽게 content 필드만 선택함
    });

    return results;
  };

  public sendMessage = async (roomId: string, userId: number, content: string) => {
    // db에 메시지 저장
    const result = await this.prisma.chat.create({
      data: {
        roomId,
        userId,
        content,
      },
    });

    return result;
  };

  public stateUpdate = async (roomId: string, state: number) => {
    // 방 상태 변경
    await this.prisma.room.update({
      where: { roomId },
      data: { state },
    });
  };

  public acceptCard = async (roomId: string) => {
    // 카드 수락에 따른 내용 업데이트
    await this.prisma.chat.updateMany({
      // 안타깝게 update는 first가 없더라
      where: { roomId, content: '`card`0' },
      data: { content: '`card`1' },
    });
  };

  public deleteCard = async (roomId: string) => {
    // 카드 기록 삭제
    await this.prisma.chat.deleteMany({
      // 안타깝게 delete는 2222
      where: { AND: [{ roomId }, { content: { contains: `\`card\`` } }] },
    });
  };

  // TODO: 해당 메소드 사용하는 로직 사라짐. 그에 따라 이 메소드도 삭제해야함
  public isReadMessage = async (chatId: number) => {
    // 안 읽은 메시지 있나 확인하려고 했었음
    const result = await this.prisma.chat.findUnique({
      where: { chatId },
    });

    return result;
  };

  // TODO: 이 메소드도 삭제해야 함
  public isNew = async (postId: number, userId: number) => {
    const [result] = await this.prisma.alarm.findMany({
      where: { postId, senderId: userId },
    });

    return result;
  };

  public createAlarm = async (
    postId: number,
    ownerId: number,
    senderId: number,
    roomId: string
  ) => {
    // 새 알람 생성
    await this.prisma.alarm.create({
      data: { postId, ownerId, senderId, roomId },
    });
  };

  public updateAlarm = async (postId: number, ownerId: number, senderId: number) => {
    // 알람 쌓임
    await this.prisma.alarm.updateMany({
      where: { postId, ownerId, senderId },
      data: { count: { increment: 1 } },
    });
  };

  public deleteAlarm = async (roomId: string, ownerId: number) => {
    // 알람 확인함. 그에 따른 알람 삭제
    await this.prisma.alarm.deleteMany({
      where: { roomId, ownerId },
    });
  };

  public deleteAllAlarm = async (ownerId: number) => {
    await this.prisma.alarm.deleteMany({
      where: { ownerId },
    });
  };

  public readYet = async (roomId: string, ownerId: number, senderId: number) => {
    // 해당 방에 안읽은 내용 있는지 확인
    const result = await this.prisma.alarm.findFirst({
      where: { roomId, ownerId, senderId },
      select: { count: true, post: true, sender: true }, // 제목, 상대 이름 출력을 위해 관계 참조
    });

    return result;
  };

  public saveSocket = async (userId: number, socketId: string) => {
    // 소켓과 유저아이디 쌍 저장
    await this.prisma.socketTable.create({
      data: {
        userId,
        socketId,
      },
    });
  };

  // TODO: 해당 메소드 사용하지 않음. 삭제 필요
  public searchSocket = async (socketId: string) => {
    const result = await this.prisma.socketTable.findUnique({
      where: { socketId },
    });

    return result;
  };

  public searchSockets = async (userId: number) => {
    // 특정 사용자가 연결된 소켓목록 조회
    const results = await this.prisma.socketTable.findMany({
      where: { userId },
      select: { socketId: true },
    });

    return results;
  };

  public deleteSocket = async (socketId: string) => {
    // 소켓 삭제
    await this.prisma.socketTable.delete({
      where: { socketId },
    });
  };

  public chatHistory = async (roomId: string) => {
    // 채팅 목록 확인
    const result = await this.prisma.chat.findMany({
      where: { roomId },
    });
    return result;
  };
}

export default ChatRepository;
