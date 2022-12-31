import CommentsService from '../services/comments.service';

class CommentsController {
  commentsService: CommentsService;

  constructor() {
    this.commentsService = new CommentsService();
  }
}

export default CommentsController;
