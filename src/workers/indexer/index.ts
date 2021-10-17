import path from 'path';
import { Worker } from 'worker_threads';
import logger from '../../adapters/logger';
import { NETWORKS } from '../../configs';

const initIndexerWorker = (chainId = 1337) => {
  const indexerWorker = new Worker(path.resolve(__dirname, './indexer.js'),
    { workerData: { chainId, path: './indexer.ts' } },
  );

  indexerWorker.on('message', result => {
    logger.info(`Iteration ${result} completed`);
  });

  indexerWorker.on('error', error => {
    logger.error(error);
  });

  indexerWorker.on('exit', exitCode => {
    logger.info(`Indexer terminated with ${exitCode}`);
  });

  indexerWorker.postMessage('start pooling');

  return indexerWorker;
};

/**
 * Initialize local network indexer (local dev purposes only)
 * @returns
 */
export const initDefaultNetworkIndexer = () => {
  return initIndexerWorker();
};

/**
 * Initialize kovan indexer
 * @returns
 */
export const initKovanNetworkIndexer = () => {
  return initIndexerWorker(NETWORKS.kovan.chainId);
};

/**
 * Initialize rinkeby indexer
 * @returns
 */
export const initRinkebyNetworkIndexer = () => {
  return initIndexerWorker(NETWORKS.rinkeby.chainId);
};
