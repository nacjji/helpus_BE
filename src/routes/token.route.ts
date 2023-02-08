import { Router } from 'express';
import TokenController from '../controllers/token.controller';

const tokenRouter = Router();
const tokenController = new TokenController();

tokenRouter.get('/', tokenController.newToken); // 새 토큰 발급
tokenRouter.delete('/', tokenController.removeToken); // 현재 브라우저의 토큰 삭제
tokenRouter.delete('/all', tokenController.removeAllToken); // 해당 유저의 모든 토큰 삭제

export default tokenRouter;
