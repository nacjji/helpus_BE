import { RequestHandler } from 'express';
import { unauthorized } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

const checkToken = (token: string) => {
  try {
    const userInfo: any = jwt.verify(token, JWT_SECRET_KEY);
    return userInfo;
  } catch (err) {
    return false;
  }
};

const requiredLogin: RequestHandler = (req, res, next) => {
  const refreshToken = req.cookies.helpus_cookie;
  const { authorization } = req.headers;

  try {
    if (!authorization || !refreshToken) throw unauthorized('로그인 필요');
    const [tokenType, tokenValue] = authorization.split(' ');

    const userInfo = checkToken(refreshToken);

    if (!userInfo) throw unauthorized('로그인 필요');

    if (tokenType === 'Bearer' && tokenValue) {
      const payload = checkToken(tokenValue);

      if (payload) {
        res.locals.userId = payload.userId;
        res.locals.userName = payload.userName;
      }
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
        next(unauthorized('로그인 정보 있음'));
      }
    } else next();
  } catch (err) {
    next();
  }
};

const passAnyway: RequestHandler = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) next();
    else {
      const [tokenType, tokenValue] = authorization.split(' ');

      if (tokenType === 'Bearer' && tokenValue) {
        const payload: any = jwt.verify(tokenValue, JWT_SECRET_KEY);

        res.locals.userId = payload.userId;
        res.locals.userName = payload.userName;
        res.locals.state1 = payload.state1;
        res.locals.state2 = payload.state2;

        next();
      } else next();
    }
  } catch (err) {
    next();
  }
};

export { requiredLogin, requiredNoLogin, passAnyway };
