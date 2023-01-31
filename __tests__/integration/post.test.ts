import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';

import prisma from '../../src/config/database/prisma';
import PostsService from '../../src/services/post.service';
import postController from '../../src/controllers/post.controller';
import App from '../../src/app';

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') throw new Error('NODE_ENV 가 개발 환경이 아닙니다.');
});

describe('게시글 조회 테스트', () => {
  it('200 status code 반환', async () => {
    const app = new App();
    const res = supertest(app);
    console.log(res);
  });
});
