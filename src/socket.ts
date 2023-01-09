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
    console.log('New client connected');

    socket.on('disconnect', () => console.log('user disconnect', socket.id));
    // 방 입장하기
    socket.on('join', async (data) => {
      try {
        const { userId, postId } = data;

        const roomId: string = await chatService.searchRoom(Number(userId), Number(postId));

        socket.emit('roomId', roomId);
        socket.join(roomId);
      } catch (err) {
        console.log(err);
      }
    });

    // 입장한 방에 메시지 보내기
    socket.on('send', (data) => {
      const { message, roomId, test } = data;
      console.log(data);
      io.to(roomId).emit('broadcast', message);
    });
  });
};

export default Socket;
