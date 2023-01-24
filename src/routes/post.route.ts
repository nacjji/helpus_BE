import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post(
  '/images/:postId',
  [multeruploader.array('post-images', 10)],
  postsController.uploadImgs
);

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
  multeruploader.fields([
    { name: 'imageUrl1', maxCount: 3 },
    { name: 'imageUrl2' },
    { name: 'imageUrl3' },
  ]),
  postsController.updatePost
);
postsRouter.delete('/:postId', requiredLogin, postsController.deletePost);

export default postsRouter;
