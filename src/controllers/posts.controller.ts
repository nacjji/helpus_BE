import PostsService from '../services/posts.service';

class PostsController {
  postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }
}

export default PostsController;
