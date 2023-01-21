/* eslint-disable no-param-reassign */
import { notFound } from '@hapi/boom';
import PostsRepository from '../repositories/post.repository';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';

const shuffle = ([...image]) => {
  let imgLength = image.length;
  while (imgLength) {
    // eslint-disable-next-line no-plusplus
    const imgIndex = Math.floor(Math.random() * imgLength--);
    [image[imgLength], image[imgIndex]] = [image[imgIndex], image[imgLength]];
  }
  return image;
};

// 랜덤으로 생성할 사진 넣기
const imgs = [
  'karl-pawlowicz-QUHuwyNgSA0-unsplash.jpg',
  'tracy-adams-TEemXOpR3cQ-unsplash.jpg',
  'markus-spiske-Skf7HxARcoc-unsplash.jpg',
];

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
    imageUrl1?: string,
    imageUrl2?: string,
    imageUrl3?: string,
    tag?: string,
    createdAt?: Date
  ) => {
    const imageFileName1 = imageUrl1?.split('/');
    const imageFileName2 = imageUrl2?.split('/');
    const imageFileName3 = imageUrl3?.split('/');

    const shuffledImg = shuffle(imgs);
    if (!imageFileName1) {
      const result = await this.postsRepository.createPost(
        userId,
        userName,
        title,
        content,
        Number(category),
        appointed,
        location1,
        location2,
        imageFileName1 ? imageFileName1[4] : shuffledImg[0],
        imageFileName2 ? imageFileName2[4] : shuffledImg[1],
        imageFileName3 ? imageFileName3[4] : shuffledImg[2],
        tag,
        createdAt
      );
      return result;
    }
    // FIXME : Refectoring 시 중복 코드 제거 필요
    const result = await this.postsRepository.createPost(
      userId,
      userName,
      title,
      content,
      Number(category),
      appointed,
      location1,
      location2,
      imageFileName1 ? imageFileName1[4] : undefined,
      imageFileName2 ? imageFileName2[4] : undefined,
      imageFileName3 ? imageFileName3[4] : undefined,
      tag,
      createdAt
    );
    return result;
  };

  // 전체 조회
  // eslint-disable-next-line class-methods-use-this
  public myLocationPosts = async (
    q: number,
    state1?: string,
    state2?: string,
    category?: number,
    search?: string
  ) => {
    const result = await this.postsRepository.myLocationPosts(q, state1, state2, category, search);

    // eslint-disable-next-line no-underscore-dangle
    const _result = result.map((v) => {
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
        imageUrl1: v.imageUrl1 || `${process.env.S3_BUCKET_URL}/${v.imageUrl1}`,
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

    // eslint-disable-next-line no-underscore-dangle
    const _result = result.map((v) => {
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
        imageUrl1: `${process.env.S3_BUCKET_URL}/${v.imageUrl1}`,

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
      imageUrl1: `${process.env.S3_BUCKET_URL}/${result.imageUrl1}`,
      imageUrl2: result.imageUrl2 && `${process.env.S3_BUCKET_URL}/${result.imageUrl2}`,
      imageUrl3: result.imageUrl3 && `${process.env.S3_BUCKET_URL}/${result.imageUrl3}`,
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
    imageUrls?: string,
    tag?: string
  ) => {
    const { imageUrl1 } = JSON.parse(JSON.stringify(imageUrls));
    const { imageUrl2 } = JSON.parse(JSON.stringify(imageUrls));
    const { imageUrl3 } = JSON.parse(JSON.stringify(imageUrls));

    const imageFileName1 = imageUrl1 ? imageUrl1[0].location.split('/') : imageUrl1;
    const imageFileName2 = imageUrl2 ? imageUrl2[0].location.split('/') : imageUrl2;
    const imageFileName3 = imageUrl3 ? imageUrl3[0].location.split('/') : imageUrl3;
    if (!imageUrl1 && !imageUrl2 && !imageUrl3) {
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
        imageFileName1 && imageFileName1[4],
        imageFileName2 && imageFileName2[4],
        imageFileName3 && imageFileName3[4],
        tag
      );
      if (!result) {
        throw notFound('게시글 없음');
      }
      return result;
    }
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
      imageFileName1 ? imageFileName1[4] : imageFileName1,
      imageFileName2 ? imageFileName2[4] : imageFileName2,
      imageFileName3 ? imageFileName3[4] : imageFileName3,
      tag
    );
    if (!result) {
      throw notFound('게시글 없음');
    }

    return result;
  };

  public deletePost = async (postId: number) => {
    const result = await this.postsRepository.deletePost(postId);
    return result;
  };
}

export default PostsService;
