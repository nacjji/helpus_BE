import { Router } from 'express';
import { multeruploader } from '../middlewares/multer.uploader';
import PostsController from '../controllers/post.controller';
import { requiredLogin, passAnyway } from '../middlewares/auth.middleware';

const postsRouter = Router();
const postsController = new PostsController();

postsRouter.post('/', [multeruploader.array('post-images', 10)], postsController.createPost);

postsRouter.get('/my-location', passAnyway, postsController.myLocationPosts);
postsRouter.get('/all-location', passAnyway, postsController.allLocationPosts);

postsRouter.get('/:postId', postsController.findDetailPost);

postsRouter.put('/:postId', postsController.updatePost);

postsRouter.delete('/:postId', postsController.deletePost);

export default postsRouter;
