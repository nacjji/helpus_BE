import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { createServer } from 'http';
import logger from './config/logger';
import errorHandler from './middlewares/errorHandler';
import morgan from './middlewares/morgan';
import router from './routes';
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
    this.app.use(cors({ origin: true, credentials: true })); // TODO: 프론트앤드 서버 배포 후 해당 도메인만 연결하도록 설정
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan);

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
    this.app.use('/api', router);
    this.app.use(errorHandler);
  }

  public listen(port: number) {
    this.setMiddlewares();
    this.httpServer.listen(port, () => {
      logger.info(`${port} 포트로 서버가 열렸습니다.`);
    });
  }
}

export default App;
