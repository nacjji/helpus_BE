import { RequestHandler } from 'express';
import { unauthorized } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

const requiredLogin: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization) throw unauthorized('로그인 필요');
    const [tokenType, tokenValue] = authorization.split(' ');

    if (tokenType === 'Bearer' && tokenValue) {
      const payload: any = jwt.verify(tokenValue, JWT_SECRET_KEY);

      res.locals.userId = payload.userId;
    }
    next();
  } catch (err) {
    throw unauthorized('로그인 필요');
  }
};

const requiredNoLogin: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (authorization) {
      const [tokenType, tokenValue] = authorization.split(' ');

      if (tokenType === 'Bearer' && tokenValue) {
        jwt.verify(tokenValue, JWT_SECRET_KEY);
        throw unauthorized('로그인 정보 있음');
      }
    }
    next();
  } catch (err) {
    next();
  }
};

export { requiredLogin, requiredNoLogin };
