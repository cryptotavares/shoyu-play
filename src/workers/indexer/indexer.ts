import { isMainThread, workerData, parentPort } from 'worker_threads';
import { getContract } from '../../adapters/ethers';
import logger from '../../adapters/logger';
import StackedError from '../../adapters/StackedError';
import { NETWORKS } from '../../configs';
import * as userEvents from '../../repositories/userEvents';
import { sleep } from '../../utils/timers';

const TIMEOUT_IN_SECONDS = 30;

if (isMainThread || !parentPort) {
  throw new StackedError('This is not a worker');
}

let exitSignalReceived = false;

const notNullParentPort = parentPort;

/**
 * Poll abstraction.
 * This method allows repeating operations until and exit signal is received.
 * @param fn
 * @returns
 */
async function pollWrapper(fn: () => any) {
  if (exitSignalReceived) {
    return;
  }

  await fn();
  await sleep(TIMEOUT_IN_SECONDS * 1000);
  await pollWrapper(fn);
}

/**
 * Query contract events in a given chain.
 *
 * @param chainId
 * @param blockStart
 * @returns
 */
const getEvents = (chainId: number, blockStart: number) => {
  const contract = getContract(chainId);

  logger.debug({ blockStart }, 'blockstart');
  return contract.queryFilter({}, blockStart);
};

/**
 * Main indexer logic.
 *
 * @param chainId
 * @returns
 */
const indexEvents = (chainId: number) => {
  return async () => {
    try {
      logger.info({ chainId }, 'Indexing');

      const networkDetails = Object.values(NETWORKS).find(network => network.chainId === chainId);
      let blockStart = networkDetails?.blockDeployed || 0;

      const latestCachedEvent = await userEvents.getLatestEventByChainId(chainId);

      if (latestCachedEvent) {
        blockStart = latestCachedEvent.blockNumber + 1;

        logger.debug(latestCachedEvent, 'latestCachedEvent');
      }

      const events = await getEvents(chainId, blockStart);

      const indexedEvents = events.map(event => ({
        blockNumber: event.blockNumber,
        blockHash: event.blockHash,
        transactionIndex: event.transactionIndex,
        removed: event.removed,
        data: event.data,
        topics: event.topics,
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        event: event.event,
        args: event.args,
        chainId,
      }));

      if (!indexedEvents.length) {
        logger.info('No new events found');
        return;
      }

      logger.debug(indexedEvents, 'NEW EVENTS');
      await userEvents.createEvents(indexedEvents);

      logger.debug(indexedEvents, 'createEvents');
    } catch (error) {
      logger.error(new StackedError('Failed to index events', error));
    }
  };
};

/**
 * Listener main thread messages.
 * It will initialize indexer polling when any message (except exit) is received.
 * When an exit message is received it will interrupt the indexer polling.
 */
notNullParentPort.on('message', message => {
  logger.info(message);

  if (message === 'exit') {
    exitSignalReceived = true;
    logger.info('Closing indexer thread');
    notNullParentPort.close();
  }

  const { chainId } = workerData;

  void pollWrapper(indexEvents(chainId as number));
});
