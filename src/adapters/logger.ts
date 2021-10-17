import pino from 'pino';
import { APP_ENV, LOG_LEVEL } from '../configs';

const logger = pino({
  level :LOG_LEVEL,
  ...( APP_ENV === 'production' ? {} : { prettyPrint: { colorize: true } }),
});


export default logger;
