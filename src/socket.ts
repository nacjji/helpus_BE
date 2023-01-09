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
    console.log('New client connected');

    // user disconnect 시 채팅 내역이 사라지므로 함수 실행부에 채팅내역을 find 해서 클라이언트에 전달하는 코드가 필요할 듯
    socket.on('disconnect', () => console.log('user disconnect', socket.id));
    // 방 입장하기
    // join 이벤트 발생시 동작하는 이벤트 핸들러
    socket.on('join', async (data) => {
      try {
        // 클라이언트에서 보낸 data 속 userId, postId를 가져옴
        const { userId, postId } = data;
        // roomId는 servcie 단의 searchRoom 메소드의 반환값으로 갖는다.
        // searchRoom의 반환값은 userId와 postId를 가진 칼럼을 찾아와 shortId 로 암호화 시킨것
        // 암호화 시킨 roomId 를 변수로 선언
        const roomId: string = await chatService.searchRoom(Number(userId), Number(postId));

        // 암호화 된 roomId를 "roomId"라는 이름을 가진 클라이언트 이벤트에게 전송한다.
        socket.emit('roomId', roomId);

        // 암호화 된 roomId 의 이름을 가진 방에 입장한다.
        socket.join(roomId);
      } catch (err) {
        console.log(err);
      }
    });

    // 입장한 방에 메시지 보내기
    // 클라이언트에서 보낸 send 네임스페이스를 가진 이벤트를 수신한다.
    socket.on('send', async (data) => {
      try {
        // data 속 content, roomId, userId, postId 를 각각의 변수로 선언한다.
        // 여기서 data 속 roomId 를 바로 보내는게 아니라 db에서 roomId 를 찾고 그 값을 보내야 함
        const { content, userId, postId } = data;
        const roomId: string = await chatService.searchRoom(Number(userId), Number(postId));

        //  chatService의 sendMessage 메소드를 실행시킨 결과를 createdAt 변수로 선언한다.
        const createdAt = await chatService.sendMessageAt(
          Number(userId),
          Number(postId),
          roomId,
          content
        );

        // 암호화 된 roomId에 참여하고 있는 모든 구성원들에게 작성자, 채팅 내용, 작성시간을 전송한다.
        io.to(roomId).emit('broadcast', { userId, content, createdAt });
      } catch (err) {
        console.log(err);
      }
    });
  });
};

// userId를 db에 저장하고 있지만, 클라이언트에 보내줘야 할 정보는 userName 일듯

export default Socket;
