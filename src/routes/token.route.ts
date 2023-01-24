import { Router } from 'express';
import TokenController from '../controllers/token.controller';
import * as auth from '../middlewares/auth.middleware';

const tokenRouter = Router();
const tokenController = new TokenController();

tokenRouter.get('/', tokenController.newToken);
tokenRouter.delete('/', tokenController.removeToken);
tokenRouter.delete('/all', tokenController.removeAllToken);

export default tokenRouter;
