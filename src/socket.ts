import * as http from 'http';
import { Server } from 'socket.io';
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

    const li: string[] = [];
    // 입장한 방에 메시지 보내기
    socket.on('room1-send', (data) => {
      li.push(`${data} , 작성자 : ${socket.id} , 작성시간 : ${Date()}`);
      io.to('room1').emit('broadcast', data);
      console.log(li);
    });
  });
};

export default Socket;
