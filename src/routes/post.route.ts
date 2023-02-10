import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  // 게시글 작성
  '/',
  requiredLogin,
  [multeruploader.array('post-images', 10)],
  postsController.createPost
);

postsRouter.get('/my-location', requiredLogin, postsController.myLocationPosts); // 내 위치 기반 글 목록

postsRouter.get('/all-location', passAnyway, postsController.allLocationPosts); // 전 지역 글 목록

postsRouter.get('/:postId', passAnyway, postsController.findDetailPost); // 특정 게시글 상세

postsRouter.put('/:postId', requiredLogin, postsController.updatePost); // 게시글 수정

postsRouter.put('/deadline/:postId', requiredLogin, postsController.deadLine); // 마감처리

postsRouter.delete('/:postId', requiredLogin, postsController.deletePost); // 게시글 삭제

export default postsRouter;
