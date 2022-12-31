import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 1 * 1000,
  max: 10,
  message: '요청이 너무 많습니다',
});

export default rateLimiter;
