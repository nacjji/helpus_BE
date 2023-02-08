import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import morgan from './middlewares/morgan';
import router from './routes';
import errorHandler from './middlewares/errorHandler';
import logger from './config/logger';
import Socket from './socket';

const { COOKIE } = process.env as { COOKIE: string };

class App {
  private app;

  private httpServer;

  private io;

  constructor() {
    this.app = express();
    this.app.set('trust proxy', true);
    this.httpServer = createServer(this.app); //소켓을 위한 서버 생성
    this.io = Socket(this.httpServer); //만든 서버에 소켓 부착
    this.app.set('io', this.io);
  }

  private setMiddlewares() {
    this.app.use(cors({ origin: true, credentials: true })); //cors 설정
    this.app.use(helmet()); //http 보안을 위한 라이브러리 helmet 사용
    this.app.use(compression());
    this.app.use(express.json()); //json 데이터를 주고받기 위함
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan); //로그 남기기 위한 morgan 라이브러리 사용
    this.app.use(
      session({
        //쿠키 생성을 위한 설정
        saveUninitialized: false,
        resave: false,
        secret: COOKIE, //쿠키에 서명 붙임
        cookie: {
          httpOnly: true, //http 통신에서만 쿠키가 오고가도록 설정
          secure: false,
        },
      })
    );
    this.app.use(cookieParser(COOKIE)); //쿠키 파싱을 위한 파서 설정
    this.app.use('/api', router); //라우터 설정
    this.app.use(errorHandler); //에러 발생시 들어갈 핸들러 부착
  }

  public listen(port: number) {
    //이벤트가 발생할 때마다 들어올 포트 설정
    this.setMiddlewares(); //요청이 들어오면 상단에서 설정한 옵션들을 차례대로 확인
    this.httpServer.listen(port, () => {
      logger.info(`${port} 포트로 서버가 열렸습니다.`);
    });
  }
}

export default App;
