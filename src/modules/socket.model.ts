import * as socketIo from 'socket.io';

const socketConnect = (httpServer: any) => {
  const ioConnect = new socketIo.Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const io = ioConnect.of('/socket/chat');
  return io;
};

export default socketConnect;
