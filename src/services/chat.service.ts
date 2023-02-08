import { nanoid } from 'nanoid'; // roomId를 위한 랜덤 고유값 생성 라이브러리
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
    // 읽지 않은 알람 목록 조회 로직
    const results = await this.chatRepository.alarmList(ownerId);

    const list = results.map((alarm: any) => {
      return {
        count: alarm.count,
        title: alarm.post.title, // 관계된 post에서 제목조회
        senderName: alarm.sender.userName, // 관계된 유저의 닉네임 조회
        roomId: alarm.roomId,
      };
    });

    return list;
  };

  public searchRoom = async (senderId: number, postId: number, ownerId: number) => {
    // 방이 존재하는지 확인하기 위한 로직
    const result = await this.chatRepository.searchRoom(senderId, postId);

    if (result) {
      // 정보 있으면 그대로 반환
      return result.roomId;
    }

    // TODO: 채팅을 안쳐도 방이 생겨버리던데, 수정하면 좋을 듯
    const roomId = nanoid(); // 없으면 방 아이디 하나 만들어서
    await this.chatRepository.createRoom(senderId, postId, roomId, ownerId); // db에 추가
    return roomId;
  };

  public roomInfo = async (roomId: string, userId: number) => {
    // 방 정보 조회 로직
    const result = await this.chatRepository.roomInfo(roomId);
    if (!result) throw badRequest('존재하지 않는 방'); // 결과가 없으면 에러 던짐

    if (result.ownerId === userId) {
      // 채팅방(게시글) 주인이 요청 보낸 유저와 같다면 sender가 상대방이 됨
      const imageURL = result.sender.userImage; // 상대방 프로필 이미지

      return {
        otherImage: imageURL.includes('http://') // 'http://'을 포함하면
          ? imageURL // 그건 그대로 전송
          : `${process.env.S3_BUCKET_URL}/profile/${imageURL}`, // 아니면 앞에 버킷 붙여줌
        otherNmae: result.sender.userName, // 상대방, 즉 sender의 닉네임
        appointed: result.Post.appointed, // 이 채팅방이 해당하는 게시글의 마감일자
        leave: result.leave,
      }; // 이걸 컨트롤러단에 넘겨줌
    }

    const imageURL = result.owner.userImage; // 위에서 함수가 안 끝났으면 owner가 상대방이 됨
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
    // 내 채팅 목록 조회 로직
    const results = await this.chatRepository.roomList(userId, q);
    // eslint-disable-next-line no-underscore-dangle
    const _results = results.map((v: any) => {
      // TODO: _results같은 경우도 list 등으로 바꾸면 좋을듯
      // 모든 map에 대해 변수명 변경 필요
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
    // 채팅 내역 저장 로직
    roomId: string,
    userId: number,
    content: string,
    card?: boolean
  ) => {
    const roomInfo = await this.chatRepository.searchRoomId(roomId); // 방 먼저 확인
    // TODO: 빈객체 말고 여기서 에러를 던져도 되지 않나?
    if (!roomInfo) {
      // 없는 방이면 빈 객체 반환
      return {};
    }
    const result = await this.chatRepository.sendMessage(roomId, userId, content); // 있는 방이면 내용 저장

    let socketId: { socketId: string }[] = []; // 소켓 목록 담을 변수 초기화
    let receiverId = 0; // 알람 받을 유저를 담을 변수 초기화

    if (roomInfo.ownerId === userId) {
      // 채팅방 주인과 현재 유저가 같은 값이라면
      socketId = await this.chatRepository.searchSockets(roomInfo.senderId); // sender가 상대방이니 상대방 소켓 목록 조회해서 저장
      receiverId = roomInfo.senderId; // 받는사람도 senderId
    } else {
      // 아니면 owner가 상대방
      socketId = await this.chatRepository.searchSockets(roomInfo.ownerId);
      receiverId = roomInfo.ownerId;
    }

    if (card) await this.chatRepository.stateUpdate(roomId, 1); // 만약 전달받은 내용이 카드라면 채팅방 상태를 1로 변경

    return {
      chatId: result.chatId,
      createdAt: result.createdAt,
      side: socketId,
      postId: roomInfo.postId,
      receiverId,
    };
  };

  public acceptCard = async (roomId: string) => {
    // 카드 요청 수락 로직
    await this.chatRepository.acceptCard(roomId); // 카드를 수락된 상태로 변경
    await this.chatRepository.stateUpdate(roomId, 2); // 채팅방의 state를 2로 변경
    // TODO: ?그런데 state라는 값이 생기면 `card`1이랑 `card`0을 따로 두지 않아도 되지 않나? 물론 프론트 로직이 같이 변경되어야함
  };

  public readMessage = async (roomId: string, userId: number) => {
    // 메시지 읽음 처리를 위한 로직
    // TODO: await 빠졌다 바보야
    this.chatRepository.deleteAlarm(roomId, userId); // 해당하는 방에 요청한 유저에게 간 알람을 삭제처리
  };

  public cancelCard = async (roomId: string) => {
    // 카드 요청 취소 로직
    await this.chatRepository.stateUpdate(roomId, 0); // 채팅방 상태를 0으로 변경
    await this.chatRepository.deleteCard(roomId); // 채팅 목록에서 카드 보냈던 흔적 제거
  };

  public getState = async (roomId: string) => {
    // 채팅방 state값 조회
    const result = await this.chatRepository.roomInfo(roomId);

    if (!result) throw badRequest('해당 채팅방 없음'); // 결과 없으면 에러 던짐
    return result.state;
  };

  public createAlarm = async (
    postId: number,
    userId: number,
    receiverId: number,
    roomId: string
  ) => {
    // 알람 저장을 위한 로직
    try {
      await this.chatRepository.createAlarm(postId, receiverId, userId, roomId); // 일단 그냥 만들어보고 만들어지면 통과
    } catch {
      await this.chatRepository.updateAlarm(postId, receiverId, userId); // 만들어지지 않으면 기존 알람에 개수만 +1 처리
    }
  };

  public readYet = async (roomId: string, ownerId: number, senderId: number) => {
    // 읽지 않은 알람 조회 로직
    const result = await this.chatRepository.readYet(roomId, ownerId, senderId);

    return result;
  };

  public saveSocket = async (userId: number, socketId: string) => {
    // 유저 소켓ID 저장 로직
    const result = await this.chatRepository.searchSocket(socketId);

    if (!result) await this.chatRepository.saveSocket(userId, socketId);
  };

  public deleteSocket = async (socketId: string) => {
    // 유저 소켓ID 삭제 로직
    const result = await this.chatRepository.searchSocket(socketId);

    if (result) await this.chatRepository.deleteSocket(socketId);
  };

  public chatHistory = async (roomId: string) => {
    // 채팅 기록 조회 로직
    const result = await this.chatRepository.chatHistory(roomId);
    return result;
  };

  public leaveRoom = async (userId: number, roomId: string, leave: number) => {
    // 채팅방 나가기 로직
    if (!leave) await this.chatRepository.leaveRoom(userId, roomId);
    // 나간 사용자가 없는 방이면 방은 유지하되, 요청한 유저만 내보냄
    else {
      // 나간 사용자가 있는 방이면
      const chatList = await this.chatRepository.searchImage(roomId); // 방 삭제하기 전에 해당 채팅방에 전송됐었던 이미지들 주소 싹 불러와서
      deleteS3ImageChat(chatList); // 전부 s3에서 지워주고
      await this.chatRepository.deleteRoom(roomId); // 방 삭제처리
    }
  };

  public uploadImage = async (userId: number, image: string, roomId: string) => {
    // 채팅방 이미지 전송 로직
    const result = await this.chatRepository.sendMessage(roomId, userId, `\`image\`${image}`); // s3에 올라간 파일 이름에 image라는 폴더명 붙여서 저장

    return result;
  };
}

export default ChatService;
