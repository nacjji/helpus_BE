import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  '/',
  requiredLogin,
  [multeruploader.array('post-image', 3)],
  postsController.createPost
);

postsRouter.get('/my-location', passAnyway, postsController.myLocationPosts);
postsRouter.get('/all-location', passAnyway, postsController.allLocationPosts);

postsRouter.get('/:postId', postsController.findDetailPost);

postsRouter.put(
  '/:postId',
  requiredLogin,
  [multeruploader.array('post-image', 3)],
  postsController.updatePost
);
postsRouter.delete('/:postId', requiredLogin, postsController.deletePost);

export default postsRouter;

// 카테고리, 제목, 내용 검색 로그인 필요 x
// 위치 로그인이 되어있다면 내위치, 안되어있다면 전체 게시글 보여주기
