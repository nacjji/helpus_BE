import jwt from 'jsonwebtoken';

const { JWT_SECRET_KEY } = process.env as { JWT_SECRET_KEY: string };

const makeAccessToken = async (
  userId: number,
  userName: string,
  state1: string,
  state2: string
) => {
  const accessToken = await jwt.sign({ userId, userName, state1, state2 }, JWT_SECRET_KEY, {
    expiresIn: '30m',
  });

  return accessToken;
};

const makeRefreshToken = async () => {
  const refreshToken = await jwt.sign({}, JWT_SECRET_KEY, {
    expiresIn: '14d',
  });

  return refreshToken;
};

export { makeAccessToken, makeRefreshToken };
