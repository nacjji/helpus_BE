import { Router } from 'express';
import PostsController from '../controllers/posts.controller';

const postsRouter = Router();
const postsController = new PostsController();

export default postsRouter;
