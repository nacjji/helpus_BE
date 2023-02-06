import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  '/',
  requiredLogin,
  // 게시글 최대 10장까지 다중 업로드
  [multeruploader.array('post-images', 10)],
  postsController.createPost
);

postsRouter.get('/my-location', requiredLogin, passAnyway, postsController.myLocationPosts);

postsRouter.get('/all-location', passAnyway, postsController.allLocationPosts);

postsRouter.get('/:postId', passAnyway, postsController.findDetailPost);

postsRouter.put('/:postId', requiredLogin, postsController.updatePost);

postsRouter.put('/deadline/:postId', requiredLogin, postsController.deadLine);

postsRouter.delete('/:postId', requiredLogin, postsController.deletePost);

export default postsRouter;
