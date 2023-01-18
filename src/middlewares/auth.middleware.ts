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

const requiredLogin: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.helpus_cookie;
    const accessToken = req.cookies.helpus_token;

    if (!accessToken || !refreshToken) throw unauthorized('로그인 필요');
    const userInfo = checkToken(refreshToken);
    if (!userInfo) throw unauthorized('로그인 필요');

    if (checkToken(accessToken)) {
      res.locals.userId = userInfo.userId;
      res.locals.userName = userInfo.userName;
      res.locals.state1 = userInfo.state1;
      res.locals.state2 = userInfo.state2;
    } else {
      const token = await jwt.sign(
        {
          userId: userInfo.userId,
          userName: userInfo.userName,
          state1: userInfo.state1,
          state2: userInfo.state2,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: '1d',
        }
      );

      res.locals.userId = userInfo.userId;
      res.locals.userName = userInfo.userName;
      res.locals.state1 = userInfo.state1;
      res.locals.state2 = userInfo.state2;

      res.cookie('helpus_token', token, { sameSite: 'none', secure: false });
    }
    next();
  } catch (err) {
    throw unauthorized('로그인 필요');
  }
};

const requiredNoLogin: RequestHandler = (req, res, next) => {
  try {
    const refreshToken = req.cookies.helpus_cookie;
    const accessToken = req.cookies.helpus_token;

    if (refreshToken && checkToken(refreshToken)) throw unauthorized('로그인 정보 있음');

    if (accessToken) {
      if (checkToken(accessToken)) throw unauthorized('로그인 정보 있음');
    }
    next();
  } catch (err) {
    next();
  }
};

const passAnyway: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.helpus_cookie;
    const accessToken = req.cookies.helpus_token;

    const userInfo = checkToken(refreshToken);

    if (!userInfo) next();
    else if (accessToken) {
      if (checkToken(accessToken)) {
        res.locals.userId = userInfo.userId;
        res.locals.userName = userInfo.userName;
        res.locals.state1 = userInfo.state1;
        res.locals.state2 = userInfo.state2;
      } else {
        const token = await jwt.sign(
          {
            userId: userInfo.userId,
            userName: userInfo.userName,
            state1: userInfo.state1,
            state2: userInfo.state2,
          },
          JWT_SECRET_KEY,
          {
            expiresIn: '1d',
          }
        );

        res.locals.userId = userInfo.userId;
        res.locals.userName = userInfo.userName;
        res.locals.state1 = userInfo.state1;
        res.locals.state2 = userInfo.state2;

        res.cookie('helpus_token', token, { sameSite: 'none', secure: false });
      }
      next();
    } else next();
  } catch (err) {
    next();
  }
};

export { requiredLogin, requiredNoLogin, passAnyway };
