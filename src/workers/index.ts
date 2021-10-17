import { Worker } from 'worker_threads';
import { IS_DEVELOPMENT, IS_PRODUCTION } from '../configs';
import {
  initDefaultNetworkIndexer,
  initKovanNetworkIndexer,
  initRinkebyNetworkIndexer,
} from './indexer';

const workerPool: Worker[] = [];

/**
 * Initialize workers.
 * Depending on the Environment that we are running.
 */
export const initWorkers = () => {
  if (IS_DEVELOPMENT) {
    workerPool.push(initDefaultNetworkIndexer());
  }

  if (IS_PRODUCTION) {
    workerPool.push(initKovanNetworkIndexer());
    workerPool.push(initRinkebyNetworkIndexer());
  }
};

/**
 * Shuts down all previously initialized workers
 */
export const shutdownWorkers = async () => {
  try {
    await Promise.all(workerPool.map(async worker => {
      worker.postMessage('exit');

      await worker.terminate();
    }));
  } catch (error) {
    throw error;
  }
};
