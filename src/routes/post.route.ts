import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  '/',
  requiredLogin,
  [multeruploader.array('post-images', 10)],
  postsController.createPost
);

postsRouter.get('/my-location', requiredLogin, passAnyway, postsController.myLocationPosts);
postsRouter.get('/all-location', passAnyway, postsController.allLocationPosts);

postsRouter.get('/:postId', postsController.findDetailPost);

postsRouter.put('/:postId', requiredLogin, postsController.updatePost);

postsRouter.delete('/:postId', requiredLogin, postsController.deletePost);

export default postsRouter;
