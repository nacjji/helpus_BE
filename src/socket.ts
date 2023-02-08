import http from 'http';
import { Server } from 'socket.io';
import './config/env';
import ChatService from './services/chat.service';

const Socket = (server: http.Server) => {
  const chatService = new ChatService();

  const io = new Server(server, {
    cors: { origin: '*' }, // cors 방지를 위해 모든 설정 열어둠. 이래도 되나 근데
    path: '/socket.io', // 이 경로는 프론트와 맞춰야 함
  });

  // socket.io 연결
  io.on('connection', (socket) => {
    socket.on('login', async (userId) => {
      // 로그인할 때 유저아이디와 소켓아이디를 쌍으로 저장하기 위한 이벤트
      try {
        await chatService.saveSocket(Number(userId), socket.id); // 객체로 받지 않고 직접 userId를 받았기 때문에 string으로 옴. 그래서 강제 형변환 진행
      } catch (err) {
        socket.emit('error', 'login 이벤트 실패');
      }
    });

    // TODO: 소켓 연결 확인을 위한 테스트 이벤트. 삭제 필요
    socket.on('test', () => {
      socket.emit('test', socket.id);
    });

    socket.on('disconnect', async () => {
      // 소켓 연결 끊어질 때 발생
      try {
        await chatService.deleteSocket(socket.id); // 끊어진 소켓을 목록에서 삭제
      } catch (err) {
        socket.emit('error', 'disconnect 이벤트 실패');
      }
    });

    socket.on('join', async (data) => {
      // 문의하기를 통해 채팅방에 들어와서 채팅방 아이디를 모르는 경우 발생
      try {
        const { senderId, postId, ownerId } = data;

        // 어떤 게시글에 누가 요청했는지 정보 가지고 방 아이디 가져옴
        const roomId: string = await chatService.searchRoom(
          // 객체로 들어와서 number로 올수도 있는데 흠... 강제형변환 필요했나?
          Number(senderId),
          Number(postId),
          Number(ownerId)
        );
        socket.emit('roomId', roomId); // 받아온 roomId 전송하는 이벤트 발생

        socket.join(roomId); // 클라이언트의 소켓아이디를 방에 입장시킴

        const chatHistory = await chatService.chatHistory(roomId); // 채팅목록 가져와서

        socket.emit('chat-history', chatHistory); // 전달하는 이벤트 발생
      } catch (err) {
        socket.emit('error', 'join 이벤트 실패');
      }
    });

    socket.on('enter', async (data) => {
      // 기존 채팅방 입장 이벤트
      try {
        const { roomId } = data; // 기존방이라 이미 roomId를 알고 있음
        // 여기서부터는 join 이벤트랑 완전히 같은데 모듈화할수 있지 않나
        socket.emit('roomId', roomId); // 프론트가 요청한 내용. roomId 다시 보내줌

        socket.join(roomId); // 소켓을 방에 입장시킴
        const chatHistory = await chatService.chatHistory(roomId); // 채팅목록 가져와서
        socket.emit('chat-history', chatHistory); // 전달
      } catch (err) {
        socket.emit('error', 'enter 이벤트 실패');
      }
    });

    // 입장한 방에 메시지 보내기
    socket.on('send', async (data) => {
      try {
        const { roomId, content, userId } = data;

        const isCard = content === `\`card\`0`; // 보낸 채팅이 카드인지 아닌지 확인
        // side는 상대방 유저가 가지고 있는 소켓아이디 리스트
        const { chatId, createdAt, side, postId, receiverId } = await chatService.sendMessageAt(
          roomId,
          userId,
          content,
          isCard
        );

        if (chatId) {
          // 채팅이 제대로 db에 생성된 경우
          io.to(roomId).emit('broadcast', { userId, content, createdAt }); // 보낸 유저아이디, 내용, 보낸 시간을 broadcast 이벤트로 발송
          if (isCard) io.to(roomId).emit('updateState', { state: 1 }); // 만약 카드 보낸거면 상태가 1로 바뀐걸 알려주기 위해 updateState 이벤트 발생
          await chatService.createAlarm(postId, userId, receiverId as number, roomId); // 일단 알람 만들어둠

          setTimeout(async () => {
            const isRead = await chatService.readYet(roomId, receiverId, userId); // 알람이 읽음처리 되어있는지 확인

            if (side && isRead) {
              // 0.5초 뒤에
              // 소켓 있는데 아직 안 읽었으면
              // eslint-disable-next-line no-restricted-syntax
              for (const list of side) {
                io.to(list.socketId).emit('new-chat', '새로운 채팅 있음'); // 소켓마다 new-chat 이벤트로 알람 발생
              }
            }
          }, 500);
        }
      } catch (err) {
        socket.emit('error', 'send 이벤트 실패');
      }
    });

    socket.on('acceptCard', async (data) => {
      // 카드 수락된 경우 전달받는 이벤트
      try {
        const { roomId } = data;
        chatService.acceptCard(roomId); // 해당 방에 카드 수락 로직
        io.to(roomId).emit('updateState', { state: 2 }); // 약속 끝난 상태인 2로 updateState 이벤트 발생시킴
      } catch (err) {
        socket.emit('error', 'acceptCard 이벤트 실패');
      }
    });

    socket.on('cancelCard', async (data) => {
      // 이미 수락했던 카드를 취소하는 이벤트
      try {
        const { roomId } = data;
        chatService.cancelCard(roomId); // 해당 방에 카드 삭제
        io.to(roomId).emit('updateState', { state: 0 }); // 카드 보내기 전 상태인 0으로 updateState 이벤트 발생시킴
      } catch (err) {
        socket.emit('error', 'cancelCard 이벤트 실패');
      }
    });

    socket.on('read', async (data) => {
      // 읽음처리 이벤트
      try {
        const { roomId, userId } = data;
        await chatService.readMessage(roomId, userId); // 어떤 방에 어떤 유저가 읽었는지 전달
      } catch (err) {
        socket.emit('error', 'read 이벤트 실패');
      }
    });

    socket.on('leave', async (data) => {
      // 퇴장 아님! 그냥 창만 닫는거
      try {
        const { roomId } = data;
        socket.leave(roomId); // 방에서 해당 소켓을 leave처리
      } catch (err) {
        socket.emit('error', 'leave 이벤트 실패');
      }
    });

    socket.on('deleteRoom', async (data) => {
      // 채팅방 나가기 이벤트
      try {
        const { roomId, userId, leave } = data;
        await chatService.leaveRoom(userId, roomId, leave); // 방을 없앨건지 얘만 퇴장처리 할건지는 서비스단에 맡김
      } catch (err) {
        socket.emit('error', 'deleteRoom 이벤트 실패');
      }
    });
  });
};

export default Socket;
