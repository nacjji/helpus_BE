/* eslint-disable class-methods-use-this */
import { RequestHandler } from 'express';
import PostsService from '../services/post.service';
import { postInputPattern } from '../validations/posts.validation';

class PostsController {
  postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }

  public createPost: RequestHandler = async (req, res, next) => {
    try {
      const { userId, userName } = res.locals;
      const { title, content, category, appointed, location1, location2, tag, createdAt } =
        await postInputPattern.validateAsync(req.body);
      const imageUrls = req.files! as Array<Express.MulterS3.File>;

      const images = imageUrls.map((image) => {
        return image.location;
      });
      const result = await this.postsService.createPost(
        userId,
        userName,
        title,
        content,
        category,
        appointed,
        location1,
        location2,
        tag,
        createdAt,
        images
      );

      return res.status(201).json({ message: '게시글 생성완료', postId: result.postId });
    } catch (err) {
      return next(err);
    }
  };

  public myLocationPosts: RequestHandler = async (req, res, next) => {
    const { state1, state2 } = res.locals;
    try {
      const search = req.query.search as string;
      const category = Number(req.query.category);
      const page = Number(req.query.page);
      const result = await this.postsService.myLocationPosts(
        page,
        state1,
        state2,
        category,
        search
      );
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public allLocationPosts: RequestHandler = async (req, res, next) => {
    const { page } = req.query;
    const search = req.query.search as string;

    const category = Number(req.query.category);

    try {
      const result = await this.postsService.allLocationPosts(Number(page), category, search);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public findDetailPost: RequestHandler = async (req, res, next) => {
    try {
      const postId = Number(req.params.postId);
      const userId = res.locals.userId || 0;
      const result = await this.postsService.findDetailPost(postId, Number(userId));
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public updatePost: RequestHandler = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { title, content, location1, category, appointed, location2, tag } = req.body;
      const { userId } = res.locals;
      await postInputPattern.validateAsync(req.body);

      const result = await this.postsService.updatePost(
        Number(postId),
        Number(userId),
        title,
        content,
        category,
        appointed,
        location1,
        location2,
        tag
      );
      return res.status(201).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public deadLine: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const { isDeadLine } = req.body;
      const { postId } = req.params;

      const result = await this.postsService.deadLine(
        Number(postId),
        Number(userId),
        Number(isDeadLine)
      );
      return res.status(201).json({ message: result.message });
    } catch (err) {
      return next(err);
    }
  };

  public deletePost: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = res.locals;
      const { postId } = req.params;
      await this.postsService.deletePost(Number(postId), Number(userId));
      return res.status(201).json({ message: '게시글이 삭제되었습니다.' });
    } catch (err) {
      return next(err);
    }
  };
}

export default PostsController;
