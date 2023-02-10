import { badRequest, notFound } from '@hapi/boom';
import PostsRepository from '../repositories/post.repository';
import AuthRepository from '../repositories/auth.repository';
import prisma from '../config/database/prisma';
import { deleteS3ImagePost } from '../middlewares/multer.uploader';
import randomImg from '../randomImg';

class PostsService {
  postsRepository: PostsRepository;

  // TODO: 삭제요망
  authRepository: AuthRepository | undefined; // 이친구 불러와놓고 사용하진 않음

  constructor() {
    this.postsRepository = new PostsRepository(prisma);
  }

  public createPost = async (
    // 게시글 생성
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
    // TODO: ?
    const imageFileName = images?.map((v) => {
      // 변수명 리팩토링 하셨겠죠??
      return v?.split('/')[4]; // 파일명만 추출
    });

    const date = Number(new Date());
    const seed = Number(date) % 30;
    const result = await this.postsRepository.createPost(
      // 우선 글 작성해서 postId 생성하고
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
    // TODO: ?
    // 그런데 여기 보다보니까, 위에서도 imgaes가 있을때 imageFilaName을 만들고 이 아래도 결국 images가 있을 때 동작하네요
    // 뭔가 깔꼬롬하게 리팩토링 할 수 있을것 같은디
    const imageUrls = imageFileName?.map((imageUrl) => {
      return { imageUrl, postId: result.postId, userId };
    });
    await this.postsRepository.uploadPostImages(
      imageUrls?.length ? imageUrls : [{ imageUrl: randomImg[seed], postId: result.postId, userId }] // 단순 궁금증! 여기 꼭 배열이어야 하나요?
    );

    return result;
  };

  public myLocationPosts = async (
    // 내 위치 기반 게시글 조회
    page: number,
    state1?: string, // TODO: ?내위치 기반인데... state가 안들어올수도 있나요?
    state2?: string,
    category?: number, // 검색어는 그렇다 쳐도 카테고리가 없을수 있나요? 얘기 한번 나눠보면 좋겠습니다
    search?: string
  ) => {
    const posts = await this.postsRepository.myLocationPosts(
      page,
      state1,
      state2,
      category,
      search
    );

    // TODO: '결과' 아니고 '결과목록'이니까 변수명 results가 어울릴 것 같아요
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
    // 전체위치 게시글 조회
    // TODO: ?변수명 확인
    const result = await this.postsRepository.allLocationPosts(q, category, search); // 여기 여전히 q네요! 리팩토링 지금은 됐겠죠?
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
    // 게시글 상세 조회
    const result = await this.postsRepository.findDetailPost(postId); // 게시글 정보 먼저 가져오고
    const isWished = await this.postsRepository.isWished(userId, postId); // 찜 되어있는지 확인하네요
    // 디비 접근 한번으로 끝내려면 조인이 두번 들어가야 하네요... 복잡스ㅠ 좀 아쉬운 부분

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
      // TODO: ?이 eslint 에러는 변수명 앞에 _ 붙어서 나는건데, 이름짓기 규칙에 약간 어긋나는 부부이라 다르게 변경하면 좋을 것 같긴 합니다
      // eslint-disable-next-line no-underscore-dangle
      Wish: result._count.Wish,
      isWished,
    };
  };

  public updatePost = async (
    // 게시글 수정
    postId: number,
    userId: number,
    title?: string,
    content?: string, // 제목, 내용이 안들어올 수 있나요?
    category?: number,
    appointed?: Date,
    location1?: string,
    location2?: string,
    tag?: string
  ) => {
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('없는 게시글');

    const postWriter = await this.postsRepository.postWriter(userId); // 이 접근은 불필요하지 않나 싶습니다. 위에 findPost에 정보가 다 담겨있어요.
    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.'); // findPost.userId !== userId로 조건 주면 되겠네요!
    const result = await this.postsRepository.updatePost(
      Number(postId),
      Number(userId), // 들여올 때 number로 들여온 친구들이라, 형변환하지 않아도 됩니다.
      title,
      content,
      Number(category),
      appointed,
      location1 || undefined, // 이미 String이거나 undefined인 변수라 || 연산자가 의미 없을 것 같아요.
      location2 || undefined,
      tag
    );
    return result;
  };

  public deadLine = async (postId: number, userId: number, isDeadLine: number) => {
    // 마감 설정
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('게시글 없음');

    const postWriter = await this.postsRepository.postWriter(userId); // 위랑 마찬가지입니다. 불필요해용
    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.');

    const result = await this.postsRepository.deadLine(postId, isDeadLine); // 얘도 findPost가 가지고 있겠네요
    if (result.isDeadLine === 2) return { message: '마감' };
    return { message: '마감 취소' };
  };

  public deletePost = async (postId: number, userId: number) => {
    // 게시글 삭제
    const findPost = await this.postsRepository.findPost(postId);
    if (!findPost) throw notFound('게시글 없음');

    const postWriter = await this.postsRepository.postWriter(userId);
    if (!postWriter) throw badRequest('게시글의 작성자가 아닙니다.'); // 마찬가지~

    const result = await this.postsRepository.deletePost(postId);

    const imageUrls = result.map((image: any) => {
      // 게시글에 연결된 이미지 주소들 가져와서
      return image.imageUrl;
    });
    deleteS3ImagePost(imageUrls); // 여기서 실제로 저장소 삭제
    return result;
  };
}

export default PostsService;
