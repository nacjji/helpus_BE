import * as http from 'http';
import { Server } from 'socket.io';
import './config/env';

const Socket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => console.log('user disconnect', socket.id));

    socket.on('new_chat', (data) => {
      io.emit('update', data);
    });
  });
};

export default Socket;
