import CommentsRepository from '../repositories/comments.repository';

class CommentsService {
  commentsRepository: CommentsRepository;

  constructor() {
    this.commentsRepository = new CommentsRepository();
  }
}

export default CommentsService;
