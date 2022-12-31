import { Router } from 'express';
import CommentsController from '../controllers/comments.controller';

const commentsRouter = Router();
const commentsController = new CommentsController();

export default commentsRouter;
