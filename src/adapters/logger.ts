import pino from 'pino';
import { IS_PRODUCTION, LOG_LEVEL } from '../configs';

const logger = pino({
  level :LOG_LEVEL,
  ...( IS_PRODUCTION ? {} : { prettyPrint: { colorize: true } }),
});


export default logger;
