import { expect } from 'chai';
import request from 'request';
import App from '../../src/app';

const app = new App();

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') throw new Error('NODE_ENV 가 개발 환경이 아닙니다.');
});

test('테스트 환경인지 테스트', () => {
  expect(process.env.NODE_ENV).equal('test');
});

describe('GET https://helpus-api.shop', () => {
  it('200을 리턴해야 한다.', (done) => {
    request.get('https://helpus-api.shop/api', (err, res, body) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
});
