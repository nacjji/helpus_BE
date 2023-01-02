import { Request, Response, NextFunction } from 'express';
import PostsService from '../services/posts.service';
import { postInputPattern, postIdPattern } from '../validations/posts.validation';

class PostsController {
  postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }

  // eslint-disable-next-line class-methods-use-this
  public createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, userName } = res.locals;
      const { title, content, category, appointed, location1, location2, tag } =
        await postInputPattern.validateAsync(req.body);
      const filesArr = req.files! as Array<Express.MulterS3.File>;

      const imageUrl = filesArr.map((file) => file.location);
      const imageUrl1 = imageUrl[0];
      const imageUrl2 = imageUrl[1];
      const imageUrl3 = imageUrl[2];
      const tagArr = tag?.split(',');
      const result = await this.postsService.createPost(
        userId,
        userName,
        title,
        content,
        category,
        appointed,
        location1,
        location2,
        imageUrl1,
        imageUrl2,
        imageUrl3,
        tag
      );
      return res.status(201).json({ result, tag: tagArr });
    } catch (err) {
      return next(err);
    }
  };

  public findAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.category) {
      return next();
    }
    try {
      // const category = Number(req.query.category);
      const q = Number(req.query.q);
      const result = await this.postsService.findAllPosts(q);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public findByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = Number(req.query.category);
      const q = Number(req.query.q);
      const result = await this.postsService.findByCategory(q, category);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public findDetailPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId);

      const result = await this.postsService.findDetailPost(postId);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId);
      const { title, content, location1, category, appointed, isDeadLine, location2, tag } =
        req.body;
      const { userId } = res.locals;
      await postInputPattern.validateAsync(req.body);
      const filesArr = req.files! as Array<Express.MulterS3.File>;
      const imageUrl = filesArr.map((file) => file.location);
      const imageUrl1 = imageUrl[0];
      const imageUrl2 = imageUrl[1];
      const imageUrl3 = imageUrl[2];

      const result = await this.postsService.updatePost(
        postId,
        userId,
        title,
        content,
        category,
        appointed,
        isDeadLine,
        location1,
        location2,
        imageUrl1,
        imageUrl2,
        imageUrl3,
        tag
      );
      return res.status(201).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId);
      await this.postsService.deletePost(postId);
      return res.status(201).json({ message: '게시글이 삭제되었습니다.' });
    } catch (err) {
      return next(err);
    }
  };
}

export default PostsController;
