import { badRequest, notFound } from '@hapi/boom';
import PostsRepository from '../repositories/post.repository';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';
import { deleteS3ImagePost } from '../middlewares/multer.uploader';
import randomImg from '../randomImg';

class PostsService {
  postsRepository: PostsRepository;

  authRepository: AuthRepository | undefined;

  constructor() {
    this.postsRepository = new PostsRepository(prisma);
  }

  public createPost = async (
    userId: number,
    userName: string,
    title: string,
    content: string,
    category: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    tag?: string,
    createdAt?: Date,
    images?: string[]
  ) => {
    const imageFileName = images?.map((image) => {
      return image?.split('/')[4];
    });

    const date = Number(new Date());
    const seed = Number(date) % 30;
    const result = await this.postsRepository.createPost(
      userId,
      userName,
      title,
      content,
      Number(category),
      appointed,
      location1,
      location2,
      tag,
      createdAt
    );

    const imageUrls = imageFileName?.map((imageUrl) => {
      return { imageUrl, postId: result.postId, userId };
    });
    await this.postsRepository.uploadPostImages(
      imageUrls?.length ? imageUrls : [{ imageUrl: randomImg[seed], postId: result.postId, userId }]
    );

    return result;
  };

  public myLocationPosts = async (
    page: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
    const posts = await this.postsRepository.myLocationPosts(
      page,
      state1,
      state2,
      category,
      search
    );

    const result = posts.map((post: any) => {
      return {
        postId: post.postId,
        userId: post.userId,

        userImage: post.user.userImage.includes('http://')
          ? post.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${post.user.userImage}`,
        title: post.title,
        content: post.content,
        category: post.category,
        appointed: post.appointed,
        isDeadLine: post.isDeadLine,
        location1: post.location1,
        location2: post.location2,
        thumbnail:
          post.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? post.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${post.PostImages[0].imageUrl}`,
        tag: post.tag,
        createdAt: post.createdAt,
        updated: post.updated,
      };
    });
    return result;
  };

  public allLocationPosts = async (q: number, category: number, search: string) => {
    const result = await this.postsRepository.allLocationPosts(q, category, search);
    const posts = result.map((post: any) => {
      return {
        postId: post.postId,
        userId: post.userId,
        userName: post.userName,
        userImage: post.user.userImage.includes('http://')
          ? post.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${post.user.userImage}`,
        title: post.title,
        content: post.content,
        category: post.category,
        appointed: post.appointed,
        isDeadLine: post.isDeadLine,
        location1: post.location1,
        location2: post.location2,

        thumbnail:
          post.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? post.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${post.PostImages[0].imageUrl}`,

        tag: post.tag,
        createdAt: post.createdAt,
        updated: post.updated,
      };
    });
    return posts;
  };

  public findDetailPost = async (postId: number, userId: number) => {
    const result = await this.postsRepository.findDetailPost(postId);

    const isWished = await this.postsRepository.isWished(userId, postId);

    if (!result) {
      throw notFound('게시글 없음');
    }
    return {
      postId: result.postId,
      userId: result.userId,
      userName: result.userName,
      userImage: result.user.userImage.includes('http://')
        ? result.user.userImage
        : `${process.env.S3_BUCKET_URL}/profile/${result.user.userImage}`,
      title: result.title,
      content: result.content,
      category: result.category,
      appointed: result.appointed,
      isDeadLine: result.isDeadLine,
      location1: result.location1,
      location2: result.location2,

      mainImage:
        result.PostImages[0].imageUrl?.split('/')[2] === 'images.unsplash.com'
          ? result.PostImages[0].imageUrl
          : `${process.env.S3_BUCKET_URL}/${result.PostImages[0].imageUrl}`,

      imageUrls: result.PostImages.map((postImage: any) => {
        return postImage.imageUrl.split('/')[2] === 'images.unsplash.com'
          ? postImage.imageUrl
          : `${process.env.S3_BUCKET_URL}/${postImage.imageUrl}`;
      }),
      tag: result.tag,
      createdAt: result.createdAt,

      updated: result.updated,

      // eslint-disable-next-line no-underscore-dangle
      Wish: result._count.Wish,
      isWished,
    };
  };

  public updatePost = async (
    postId: number,
    userId: number,
    title?: string,
    content?: string,
    category?: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    tag?: string
  ) => {
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('없는 게시글');

    const postWriter = await this.postsRepository.postWriter(userId);

    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.updatePost(
      Number(postId),
      Number(userId),
      title,
      content,
      Number(category),
      appointed,

      location1 || undefined,
      location2 || undefined,
      tag
    );
    return result;
  };

  public deadLine = async (postId: number, userId: number, isDeadLine: number) => {
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('게시글 없음');

    const postWriter = await this.postsRepository.postWriter(userId);
    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.deadLine(postId, isDeadLine);

    if (result.isDeadLine === 2) return { message: '마감' };

    return { message: '마감 취소' };
  };

  public deletePost = async (postId: number, userId: number) => {
    const findPost = await this.postsRepository.findPost(postId);

    if (!findPost) throw notFound('게시글 없음');

    const postWriter = await this.postsRepository.postWriter(userId);

    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.deletePost(postId);

    const imageUrls = result.map((image: any) => {
      return image.imageUrl;
    });
    deleteS3ImagePost(imageUrls);
    return result;
  };
}

export default PostsService;
