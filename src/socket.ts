import * as http from 'http';
import { Server } from 'socket.io';
import './config/env';
import ChatService from './services/chat.service';

const Socket = (server: http.Server) => {
  const chatService = new ChatService();

  const io = new Server(server, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  // socket.io 연결
  io.on('connection', (socket) => {
    socket.on('login', async (userId) => {
      try {
        await chatService.saveSocket(Number(userId), socket.id);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('test', () => {
      socket.emit('test', socket.id);
    });

    socket.on('disconnect', async () => {
      try {
        await chatService.deleteSocket(socket.id);
      } catch (err) {
        console.log(err);
      }
    });
    // 방 입장하기

    socket.on('join', async (data) => {
      try {
        const { userId, postId } = data;

        const roomId: string = await chatService.searchRoom(Number(userId), Number(postId));
        // 암호화 된 roomId를 "roomId"라는 이름을 가진 클라이언트 이벤트에게 전송한다.
        socket.emit('roomId', roomId);

        // 암호화 된 roomId 의 이름을 가진 방에 입장한다.
        socket.join(roomId);

        const chatHistory = await chatService.chatHistory(roomId);

        socket.emit('chat-history', chatHistory);
      } catch (err) {
        console.log(err);
      }
    });

    // 입장한 방에 메시지 보내기
    socket.on('send', async (data) => {
      try {
        const { content, userId, postId } = data;
        const roomId: string = await chatService.searchRoom(Number(userId), Number(postId));

        //  chatService의 sendMessage 메소드를 실행시킨 결과를 createdAt 변수로 선언한다.
        const createdAt = await chatService.sendMessageAt(
          Number(userId),
          Number(postId),
          roomId,
          content
        );

        io.to(roomId).emit('broadcast', { userId, content, createdAt });
      } catch (err) {
        console.log(err);
      }
    });
  });
};

// userId를 db에 저장하고 있지만, 클라이언트에 보내줘야 할 정보는 userName 일듯
export default Socket;
