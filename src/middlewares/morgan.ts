import * as morgan from 'morgan';
import logger from '../config/logger';

const stream: morgan.StreamOptions = {
  write(message) {
    logger.http(message);
  },
};
const skip = () => process.env.NODE_ENV !== 'development';

export default morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream, skip });
