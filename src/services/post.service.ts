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
    // 이미지 파일명만 추출
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
      createdAt
    );
    // 생성되는 시간을 30으로 나눈 나머지의 값은 0~29, 배열형태의 randomImg에서 인덱스 값으로 쓰일 예정
    const date = Number(new Date());
    const seed = Number(date) % 30;

    // 이미지 파일명을 객체 형태로 재배치, postId와 userId를 담아 postImage 테이블에 넣기 위해 레포지토리로 보냄
    const imageUrls = imageFileName?.map((imageUrl) => {
      return { imageUrl, postId: result.postId, userId };
    });
    // 게시글 이미지를 없이 게시할 경우 randomImg 배열의 seed 번째 이미지 url 을 넣는다.
    await this.postsRepository.uploadPostImages(imageUrls?.length ? imageUrls : [randomImg[seed]]);

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

    // eslint-disable-next-line no-underscore-dangle
    const result = posts.map((post: any) => {
      return {
        postId: post.postId,
        userId: post.userId,
        // 프로필 사진에 https:// 가 포함된단면 유저가 직접 업로드한 이미지임
        userImage: post.user.userImage.includes('http://')
          ? post.user.userImage
          : // s3 버킷에 업로드 된 이미지는 파일명으로만 저장되기 때문에 버킷 URL을 붙여서 보냄
            `${process.env.S3_BUCKET_URL}/profile/${post.user.userImage}`,
        title: post.title,
        content: post.content,
        category: post.category,
        appointed: post.appointed,
        isDeadLine: post.isDeadLine,
        location1: post.location1,
        location2: post.location2,
        thumbnail:
          // 썸네일 이미지는 게시글 이미지의 첫 번째 이미지로 설정
          // 이미지 URL을 나눴을 때 랜덤 이미지로 생성한 이미지가 아니라면 S3버킷에 업로드된 이미지를 보냄
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
        // postlist 페이지에서 표시할 썸네일 이미지
        thumbnail:
          post.PostImages[0].imageUrl.split('/')[2] === 'images.unsplash.com'
            ? post.PostImages[0].imageUrl
            : `${process.env.S3_BUCKET_URL}/${post.PostImages[0].imageUrl}`,
        // 태그는 ,를 기준으로 프론트가 split 해서 나타냄
        tag: post.tag,
        createdAt: post.createdAt,
        updated: post.updated,
      };
    });
    return posts;
  };

  public findDetailPost = async (postId: number, userId: number) => {
    const result = await this.postsRepository.findDetailPost(postId);
    // 해당 게시글 찜 여부를 보여주기 위해 isWished 메소드를 사용
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
      // 프론트 요청으로 메인이미지 추가로 보내줌
      // 이미지 중 가장 크게 나타낼 이미지
      mainImage:
        // 게시글 이미지를 추가하지 않은 랜덤이미지라면
        result.PostImages[0].imageUrl?.split('/')[2] === 'images.unsplash.com'
          ? // 이미지 URL 그대로 리턴하고
            result.PostImages[0].imageUrl
          : // 작성자가 직접 업로드한 이미지라면 버킷 주소 포함
            `${process.env.S3_BUCKET_URL}/${result.PostImages[0].imageUrl}`,

      // 게시글 이미지 [{},{}]형태
      imageUrls: result.PostImages.map((postImage: any) => {
        return postImage.imageUrl.split('/')[2] === 'images.unsplash.com'
          ? postImage.imageUrl
          : `${process.env.S3_BUCKET_URL}/${postImage.imageUrl}`;
      }),
      tag: result.tag,
      createdAt: result.createdAt,
      // 수정됨(0,1)
      updated: result.updated,
      // 찜 개수
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
      // 지역 정보가 없으면 작업을 수행하지 않음
      location1 || undefined,
      location2 || undefined,
      tag
    );
    return result;
  };

  public deadLine = async (postId: number, userId: number, isDeadLine: number) => {
    // 게시글 존재 여부 찾기
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('게시글 없음');

    // 게시글 작성자 여부 찾기
    const postWriter = await this.postsRepository.postWriter(userId);
    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.deadLine(postId, isDeadLine);
    // 1이 마감된 상태, 2는 마감 안 된 상태
    // 마감이 안 된 상태면 마감 메시지를 리턴
    if (result.isDeadLine === 2) return { message: '마감' };
    // 마감이 된 상태면 마감 취소 메시지를 리턴
    return { message: '마감 취소' };
  };

  public deletePost = async (postId: number, userId: number) => {
    const findPost = await this.postsRepository.findPost(postId);

    if (!findPost) throw notFound('게시글 없음');

    const postWriter = await this.postsRepository.postWriter(userId);

    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.deletePost(postId);

    // 게시글이 삭제되면 게시글에 포함된 이미지도 S3에서 삭제
    // 이미지의 URL만 multer 미들웨어로 보내 삭제
    const imageUrls = result.map((image: any) => {
      return image.imageUrl;
    });
    deleteS3ImagePost(imageUrls);
    return result;
  };
}

export default PostsService;
