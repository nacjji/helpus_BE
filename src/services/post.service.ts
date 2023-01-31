/* eslint-disable no-param-reassign */
import { badRequest, notFound } from '@hapi/boom';
import PostsRepository from '../repositories/post.repository';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';
import { deleteS3ImagePost } from '../middlewares/multer.uploader';
import randomImg from '../../randomImg';

const rand = Math.floor(Math.random() * 30);

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
    const imageFileName = images?.map((v) => {
      return v?.split('/')[4];
    });

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
      createdAt,
      imageFileName?.length ? imageFileName : [randomImg[rand]]
    );
    return result;
  };

  public myLocationPosts = async (
    q: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
    const result = await this.postsRepository.myLocationPosts(q, state1, state2, category, search);

    // eslint-disable-next-line no-underscore-dangle
    const _result = result.map((v: any) => {
      return {
        postId: v.postId,
        userId: v.userId,
        userImage: v.user.userImage.includes('http://')
          ? v.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.user.userImage}`,
        title: v.title,
        content: v.content,
        category: v.category,
        appointed: v.appointed,
        isDeadLine: v.isDeadLine,
        location1: v.location1,
        location2: v.location2,
        imageUrls: v.PostImages.map((val: any) => {
          return val.imageUrl.split('/')[2] === 'images.unsplash.com'
            ? val.imageUrl
            : `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
        }),
        tag: v.tag,
        createdAt: v.createdAt,
        updated: v.updated,
      };
    });

    return _result;
  };

  public allLocationPosts = async (q: number, category: number, search: string) => {
    const result = await this.postsRepository.allLocationPosts(q, category, search);
    // eslint-disable-next-line no-underscore-dangle
    const _result = result.map((v: any) => {
      return {
        postId: v.postId,
        userId: v.userId,
        userName: v.userName,
        userImage: v.user.userImage.includes('http://')
          ? v.user.userImage
          : `${process.env.S3_BUCKET_URL}/profile/${v.user.userImage}`,
        title: v.title,
        content: v.content,
        category: v.category,
        appointed: v.appointed,
        isDeadLine: v.isDeadLine,
        location1: v.location1,
        location2: v.location2,
        imageUrls: v.PostImages.map((val: any) => {
          return val.imageUrl.split('/')[2] === 'images.unsplash.com'
            ? val.imageUrl
            : `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
        }),
        tag: v.tag,
        createdAt: v.createdAt,
        updated: v.updated,
      };
    });
    return _result;
  };

  public findDetailPost = async (postId: number) => {
    const result = await this.postsRepository.findDetailPost(postId);

    if (!result) {
      throw notFound('게시글 없음');
    }
    // eslint-disable-next-line no-underscore-dangle
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
      mainImage: result.PostImages[0].imageUrl,
      imageUrls: result.PostImages.map((val: any) => {
        return val.imageUrl.split('/')[2] === 'images.unsplash.com'
          ? val.imageUrl
          : `${process.env.S3_BUCKET_URL}/${val.imageUrl}`;
      }),
      tag: result.tag,
      createdAt: result.createdAt,
      updated: result.updated,
      // eslint-disable-next-line no-underscore-dangle
      Wish: result._count.Wish,
    };
  };

  public updatePost = async (
    postId: number,
    userId: number,
    title?: string,
    content?: string,
    category?: number,
    appointed?: Date,
    isDeadLine?: number,
    location1?: string,
    location2?: string,
    tag?: string
  ) => {
    const result = await this.postsRepository.updatePost(
      Number(postId),
      Number(userId),
      title,
      content,
      Number(category),
      appointed,
      Number(isDeadLine),
      location1 || undefined,
      location2 || undefined,
      tag
    );
    if (!result) {
      throw notFound('게시글 없음');
    }
    return result;
  };

  public deletePost = async (postId: number, userId: number) => {
    const result = await this.postsRepository.deletePost(postId, userId);
    // if (userId !== result.userId) throw badRequest('게시글의 작성자가 아닙니다.');
    const imageUrls = result.map((v: any) => {
      return v.imageUrl;
    });
    deleteS3ImagePost(imageUrls);
    return result;
  };
}

export default PostsService;
