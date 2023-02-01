// /* eslint-disable import/no-named-default */
// /* eslint-disable camelcase */
// /* eslint-disable new-cap */
// /* eslint-disable @typescript-eslint/no-var-requires */
// /* eslint-disable no-undef */
// import { get, post } from 'request';
// import { expect } from 'chai';
// import { default as postRepository } from '../../src/repositories/post.repository';
// import prisma from '../../src/config/database/prisma';
// import { default as postController } from '../../src/controllers/post.controller';

// const postsRepository_mock = new postRepository(prisma);
// const postsController_mock = new postController();

// beforeAll(async () => {
//   if (process.env.NODE_ENV !== 'test') throw new Error('NODE_ENV 가 개발 환경이 아닙니다.');
// });

// test('테스트 환경인지 테스트', () => {
//   expect(process.env.NODE_ENV).equal('test');
// });

// describe('GET http://localhost:3001/api', () => {
//   it('200을 리턴해야 한다.', (done) => {
//     get('http://localhost:3001/api', (err, res, body) => {
//       expect(res.statusCode).to.equal(200);
//       done();
//     });
//   });

//   it('테스트 db 전체 게시글 배열 데이터를 받아와야 한다.', (done) => {
//     const q = 0;
//     const category = 0;
//     const search = '';
//     get('http://localhost:3001/api/post/all-location', async (err, res, body) => {
//       expect(res.statusCode).to.equal(200);
//       const mockPostsData = await postsRepository_mock.allLocationPosts(q, category, search);
//       expect(mockPostsData).to.be.a('object');
//       done();
//     });
//   });

//   //   it('테스트 db 게시글 생성, 201', (done) => {
//   //     post('http://localhost:3001/api/post', async (err, res, body) => {
//   //       expect(res.statusCode).to.equal(201);
//   //       const userId = 1;
//   //       const userName = 'test3';
//   //       const title = 'create test';
//   //       const content = 'create content';
//   //       const appointed = Date.now();
//   //       const category = 1;
//   //       const location1 = '서울특별시';
//   //       const location2 = '관악구';
//   //       const tag = 'tag1,tag2';
//   //       const createdAt = Date();
//   //       const imageUrls = ['URL1', 'URL2'];
//   //       const mockPostsCreate = await postsRepository_mock.createPost(
//   //         userId,
//   //         userName,
//   //         title,
//   //         content,
//   //         category,
//   //         appointed,
//   //         location1,
//   //         location2,
//   //         tag,
//   //         createdAt,
//   //         imageUrls
//   //       );
//   //     });
//   //   });
// });

import request from 'supertest';

import App from '../../src/app';

const app = new App();
describe('api test', () => {
  it('api 연결 테스트', async () => {
    const response = await request(app).get('/api');
    expect(response.statusCode).toEqual(200);
  });
});
