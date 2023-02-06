import { RequestHandler } from 'express-serve-static-core';

const deleteCookie: RequestHandler = (req, res, next) => {
  res.cookie('helpusAccess', '', { sameSite: 'none', secure: true });
  res.cookie('helpusRefresh', '', { sameSite: 'none', secure: true });

  next();
};

const makeCookie: RequestHandler = (req, res, next) => {
  res.cookie('helpusAccess', res.locals.access, {
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 24 * 14 * 1000,
  });

  if (res.locals.refresh !== undefined) {
    res.cookie('helpusRefresh', res.locals.refresh, {
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 24 * 14 * 1000,
    });
  }

  next();
};

export { deleteCookie, makeCookie };
