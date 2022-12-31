import PostsRepository from '../repositories/posts.repository';

class PostsService {
  postsRepository: PostsRepository;

  constructor() {
    this.postsRepository = new PostsRepository();
  }
}

export default PostsService;
