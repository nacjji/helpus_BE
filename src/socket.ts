import * as http from 'http';
import { Server } from 'socket.io';
import * as shortid from 'shortid';
import './config/env';

const Socket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  const chat1 = io.of('/chat1');
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => console.log('user disconnect', socket.id));
    // 방 입장하기
    socket.on('join-room', () => {
      socket.join('room1');
    });

    // 입장한 방에 메시지 보내기
    socket.on('send', (data) => {
      const { message, roomId } = data;
      console.log(data);
      io.to(roomId).emit('broadcast', message);
    });
  });
};

export default Socket;
