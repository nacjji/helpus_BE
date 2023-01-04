/* eslint-disable class-methods-use-this */
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

  // public searchPost = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     if (!req.query.search || req.query.category) {
  //       return next();
  //     }
  //     console.log(req.query.search);
  //     console.log('searchPost');
  //     const { userId } = res.locals;
  //     const search = req.query.search as string;
  //     const { q } = req.query;
  //     const result = await this.postsService.searchPost(Number(userId), search, Number(q));
  //     return res.status(200).json({ result });
  //   } catch (err) {
  //     return next(err);
  //   }
  // };

  // 전체 게시글 조회
  public findAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals;
    const mylocation = req.query.mylocation as string;
    const category = Number(req.query.category);
    const search = req.query.search as string;
    console.log(userId);
    console.log('findAllPosts');
    try {
      // const category = Number(req.query.category);
      const q = Number(req.query.q);
      const result = await this.postsService.findAllPosts(userId, q, mylocation, category, search);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  // public findByCategory = async (req: Request, res: Response, next: NextFunction) => {
  //   console.log('findByCategory');
  //   const search = req.query.search as string;
  //   // if (req.query.search) {
  //   //   return next();
  //   // }
  //   try {
  //     const category = Number(req.query.category);
  //     const q = Number(req.query.q);
  //     const result = await this.postsService.findByCategory(q, category, search);
  //     return res.status(200).json({ result });
  //   } catch (err) {
  //     return next(err);
  //   }
  // };

  public findDetailPost = async (req: Request, res: Response, next: NextFunction) => {
    console.log('findDetailPost');

    try {
      const postId = Number(req.params.postId);
      const { userId } = res.locals;

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
