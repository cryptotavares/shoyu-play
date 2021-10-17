export const APP_NAME = process.env.APP_NAME || 'shoyu-play';
export const APP_ENV = process.env.APP_ENV || 'development';

export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const HTTP_SERVER_PORT = process.env.HTTP_SERVER_PORT || 4992;

export const DB_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27037';
export const DB_NAME: string = process.env.MONGO_DB_NAME || 'dev';

export const MAX_SERVER_SHUTDOWN_RETRIES = 10;
export const SHUTDOWN_RETRY_INTERVAL = 500;

export const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
export const SIGN_MESSAGE = process.env.SIGN_MESSAGE || "I'd like to sign in";

export const NETWORKS = {
  default: {
    chainId: process.env.DEFAULT_CHAIN_ID || 1337,
    address: process.env.DEFAULT_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    blockDeployed: 1,
  },
  kovan: {
    chainId: 42,
    address: process.env.KOVAN_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    blockDeployed: 1,
  },
  rinkeby: {
    chainId: 4,
    address: process.env.RINKEBY_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    blockDeployed: 1,
  },
};
