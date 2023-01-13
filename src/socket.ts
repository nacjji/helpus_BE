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
        socket.emit('error', 'login 이벤트 실패');
      }
    });

    socket.on('test', () => {
      socket.emit('test', socket.id);
    });

    socket.on('disconnect', async () => {
      try {
        await chatService.deleteSocket(socket.id);
      } catch (err) {
        socket.emit('error', 'test 이벤트 실패');
      }
    });
    // 방 입장하기

    socket.on('join', async (data) => {
      try {
        const { senderId, postId, ownerId } = data;

        const roomId: string = await chatService.searchRoom(
          Number(senderId),
          Number(postId),
          Number(ownerId)
        );
        socket.emit('roomId', roomId);

        socket.join(roomId);

        const chatHistory = await chatService.chatHistory(roomId);

        socket.emit('chat-history', chatHistory);
      } catch (err) {
        socket.emit('error', 'join 이벤트 실패');
      }
    });

    socket.on('enter', async (data) => {
      try {
        const { roomId } = data;
        socket.emit('roomId', roomId);

        socket.join(roomId);
        const chatHistory = await chatService.chatHistory(roomId);
        socket.emit('chat-history', chatHistory);
      } catch (err) {
        socket.emit('error', 'enter 이벤트 실패');
      }
    });

    // 입장한 방에 메시지 보내기
    socket.on('send', async (data) => {
      try {
        const { roomId, content, userId } = data;

        const { chatId, createdAt, side, senderName, postId, title, receiverId } =
          await chatService.sendMessageAt(roomId, userId, content);

        if (chatId) {
          io.to(roomId).emit('broadcast', { userId, content, createdAt });

          setTimeout(async () => {
            const readYet = await chatService.isReadMessage(postId, userId, receiverId);

            if (readYet !== 0) {
              // eslint-disable-next-line no-restricted-syntax
              for (const list of side) {
                io.to(list.socketId).emit('new-chat', { senderName, title, readYet });
              }
            }
          }, 500);
        }
      } catch (err) {
        socket.emit('error', 'send 이벤트 실패');
      }
    });

    socket.on('read', async (data) => {
      try {
        const { roomId } = data;
        await chatService.readMessage(roomId);
      } catch (err) {
        socket.emit('error', 'read 이벤트 실패');
      }
    });
  });
};

// userId를 db에 저장하고 있지만, 클라이언트에 보내줘야 할 정보는 userName 일듯
export default Socket;
