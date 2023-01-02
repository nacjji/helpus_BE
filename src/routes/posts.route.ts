import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/posts.controller';
import { requiredLogin } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  '/',
  requiredLogin,
  [multeruploader.array('post-image', 3)],
  postsController.createPost
);
postsRouter.get('/', postsController.findAllPosts);
postsRouter.get('/', postsController.findByCategory);
postsRouter.get('/:postId', postsController.findDetailPost);
postsRouter.put(
  '/:postId',
  requiredLogin,
  [multeruploader.array('post-image', 3)],
  postsController.updatePost
);
postsRouter.delete('/:postId', requiredLogin, postsController.deletePost);

export default postsRouter;
