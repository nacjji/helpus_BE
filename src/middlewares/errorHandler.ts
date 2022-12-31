import { ErrorRequestHandler } from 'express';
import logger from 'config/logger';

const errorHandler: ErrorRequestHandler = (err, req, res) => {
  const { stack } = err;
  logger.error(stack);

  if (err.isBoom) res.status(err.output.statusCode).json({ errorMessage: err.message });
  else if (err.isJoi) res.status(400).json({ errorMessage: '요구사항에 맞지 않는 입력값' });
  else res.status(500).json({ errorMessage: '알 수 없는 오류' });
};

export default errorHandler;
