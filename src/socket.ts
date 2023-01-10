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

        socket.emit('roomId', roomId);
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
        const { content, roomId, userId, postId } = data;
        const createdAt = await chatService.sendMessage(
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

export default Socket;
