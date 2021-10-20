import { Worker } from 'worker_threads';
import { NETWORKS } from '../configs';
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
  if (NETWORKS.default.enabled) {
    workerPool.push(initDefaultNetworkIndexer());
  }

  if (NETWORKS.kovan.enabled) {
    workerPool.push(initKovanNetworkIndexer());
  }

  if (NETWORKS.rinkeby.enabled) {
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
