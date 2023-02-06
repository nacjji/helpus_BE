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
      // multeruploader 설정이 array이기 때문에 Array 형식으로 req.files 를 받아옴
      const imageUrls = req.files! as Array<Express.MulterS3.File>;

      const images = imageUrls.map((image) => {
        return image.location;
      });
      await this.postsService.createPost(
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

      return res.status(201).json({ message: '게시글 생성완료' });
    } catch (err) {
      return next(err);
    }
  };

  // 내 위치 게시글 조회
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

  // 전국 게시글 조회
  public allLocationPosts: RequestHandler = async (req, res, next) => {
    const page = Number(req.query.q);
    const search = req.query.search as string;

    const category = Number(req.query.category);

    try {
      const result = await this.postsService.allLocationPosts(page, category, search);
      return res.status(200).json({ result });
    } catch (err) {
      return next(err);
    }
  };

  public findDetailPost: RequestHandler = async (req, res, next) => {
    try {
      const postId = Number(req.params.postId);
      // 찜 여부를 표시해야 해서 로그인 유저의 userId가 필요하지만 로그인 정보가 없을 경우 0을 보내 아무 작업도 수행하지 않게 함
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
