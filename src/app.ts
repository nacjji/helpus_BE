import * as express from 'express';
import * as cors from 'cors';
import helmet from 'helmet';
import * as compression from 'compression';
import { createServer } from 'http';
import morgan from './middlewares/morgan';
import router from './routes';
import errorHandler from './middlewares/errorHandler';
import logger from './config/logger';
import Socket from './socket';

class App {
  private app;

  private httpServer;

  private io;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = Socket(this.httpServer);
    console.log(this.io);
    this.app.set('io', this.io);
  }

  private setMiddlewares() {
    this.app.use(cors({ origin: '*', credentials: true })); // TODO: 프론트앤드 서버 배포 후 해당 도메인만 연결하도록 설정
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan);
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
