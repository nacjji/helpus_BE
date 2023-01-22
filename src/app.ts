import * as express from 'express';
import session = require('express-session');
import cookieParser = require('cookie-parser');
import * as cors from 'cors';
import helmet from 'helmet';
import * as compression from 'compression';
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
    this.httpServer = createServer(this.app);
    this.io = Socket(this.httpServer);
    this.app.set('io', this.io);
  }

  private setMiddlewares() {
    this.app.use(
      cors({ origin: 'https://helpus-nqp8ww3h7-helpus.vercel.app/', credentials: true })
    ); // TODO: 프론트앤드 서버 배포 후 해당 도메인만 연결하도록 설정
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan);
    this.app.use('/api', router);
    this.app.use(errorHandler);
    //TODO: 프론트까지 배포 완료 이후 쿠키 보안 설정
    this.app.use(
      session({
        saveUninitialized: false,
        resave: false,
        secret: COOKIE,
        cookie: {
          httpOnly: true,
          secure: false,
        },
      })
    );
    this.app.use(cookieParser(COOKIE));
  }

  public listen(port: number) {
    this.setMiddlewares();
    this.httpServer.listen(port, () => {
      logger.info(`${port} 포트로 서버가 열렸습니다.`);
    });
  }
}

export default App;
