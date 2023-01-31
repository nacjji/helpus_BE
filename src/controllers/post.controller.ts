/* eslint-disable class-methods-use-this */
import { badRequest, unauthorized } from '@hapi/boom';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import PostsService from '../services/post.service';
import { postInputPattern } from '../validations/posts.validation';

class PostsController {
  postsService: PostsService;

  constructor() {
    this.postsService = new PostsService();
  }

  // eslint-disable-next-line class-methods-use-this
  public createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const userId = 2;
      // const userName = 'test2';

      const { userId, userName } = res.locals;

      const { title, content, category, appointed, location1, location2, tag, createdAt } =
        await postInputPattern.validateAsync(req.body);

      const imageUrls = req.files! as Array<Express.MulterS3.File>;
      const images = imageUrls.map((v) => {
        return v.location;
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

      return res.status(201).json({ result, images });
    } catch (err) {
      return next(err);
    }
  };

  // 내 위치 게시글 조회
  public myLocationPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, state1, state2 } = res.locals;
    try {
      if (!userId) {
        throw unauthorized('내 위치 게시글 조회는 로그인 후 사용 가능한 기능입니다.');
      }
      const search = req.query.search as string;
      const category = Number(req.query.category);
      const q = Number(req.query.q);
      const result = await this.postsService.myLocationPosts(q, state1, state2, category, search);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  // 전국 게시글 조회
  public allLocationPosts = async (req: Request, res: Response, next: NextFunction) => {
    const q = Number(req.query.q);
    const search = req.query.search as string;

    const category = Number(req.query.category);

    try {
      const result = await this.postsService.allLocationPosts(q, category, search);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public findDetailPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId);

      if (req.params.postId === 'mylocation') {
        return next();
      }

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
      return res.status(200).send('ok');

      if (!postInputPattern.validateAsync) {
        throw badRequest('수정사항이 없습니다.');
      }
      await postInputPattern.validateAsync(req.body);

      const result = await this.postsService.updatePost(
        postId,
        Number(userId),
        title,
        content,
        category,
        appointed,
        isDeadLine,
        location1,
        location2,
        tag
      );
      return res.status(201).json({ result });
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
