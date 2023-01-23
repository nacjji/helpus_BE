import { RequestHandler } from 'express';
import { unauthorized, badRequest } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

const checkToken = (token: string) => {
  try {
    const payload: any = jwt.verify(token, JWT_SECRET_KEY);
    return payload;
  } catch {
    return false;
  }
};

const requiredLogin: RequestHandler = (req, res, next) => {
  const { helpusAccess, helpusRefresh } = req.cookies;

  if (!helpusAccess && !helpusRefresh) throw unauthorized('로그인 필요');
  if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');

  const payload = checkToken(helpusAccess);
  const expired = checkToken(helpusRefresh);
  if (!payload) throw unauthorized('토큰 재발급 필요');
  if (!expired) throw unauthorized('로그인 필요');

  res.locals.userId = payload.userId;
  res.locals.userName = payload.userName;
  res.locals.state1 = payload.state1;
  res.locals.state2 = payload.state2;

  next();
};

const requiredNoLogin: RequestHandler = (req, res, next) => {
  const { helpusAccess, helpusRefresh } = req.cookies;

  if (!helpusAccess && !helpusRefresh) next();
  else if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');
  else {
    const payload = checkToken(helpusAccess);

    if (payload) throw unauthorized('로그인 정보 있음');
  }
};

const passAnyway: RequestHandler = (req, res, next) => {
  const { helpusAccess, helpusRefresh } = req.cookies;

  if (!helpusAccess && !helpusRefresh) next();
  else if (!helpusAccess || !helpusRefresh) throw badRequest('비정상 토큰으로 확인됨');
  else {
    const payload = checkToken(helpusAccess);

    if (payload) {
      res.locals.userId = payload.userId;
      res.locals.userName = payload.userName;
      res.locals.state1 = payload.state1;
      res.locals.state2 = payload.state2;
    }

    next();
  }
};

export { requiredLogin, requiredNoLogin, passAnyway };
