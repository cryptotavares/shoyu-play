import { Server } from 'http';
import { closeDbClient } from './adapters/database';
import logger  from './adapters/logger';
import { MAX_SERVER_SHUTDOWN_RETRIES, SHUTDOWN_RETRY_INTERVAL } from './configs';
import { sleep } from './utils/timers';
import { shutdownWorkers } from './workers';

let isShuttingDown = false;

/**
 * Checks if there are any pending requests on the server.
 * @param server
 * @returns
 */
function checkPendingRequests(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.getConnections((err: Error | null, pendingRequests: number) => {
      if (err) {
        logger.error('Failed to get server pending connections');
        return reject(err);
      }

      if (pendingRequests > 0) {
        const error = new Error(`There are pending requests: ${pendingRequests}`);

        return reject(error);
      }

      return resolve();
    });
  });
}

/**
 * Gracefull shuts down http server
 * @param server
 * @param shutdownRetryCount
 * @returns
 */
async function shutdownHttpServer(
  server: Server,
  shutdownRetryCount = 0,
): Promise<Error | void> {
  let retryCount = shutdownRetryCount;

  if (!isShuttingDown) {
    server.close(() => {
      logger.info('Server closed successfully.');
    });

    isShuttingDown = true;
  }

  const pendingState = await checkPendingRequests(server)
    .catch((err: Error) => err);

  if (!pendingState || shutdownRetryCount === MAX_SERVER_SHUTDOWN_RETRIES - 1) {
    return pendingState;
  }

  logger.error(pendingState);
  retryCount += 1;
  await sleep(SHUTDOWN_RETRY_INTERVAL);

  return shutdownHttpServer(server, retryCount);
}

/**
 * Close Db connections
 *
 * @returns
 */
async function closeDatabase(): Promise<Error | void> {
  return closeDbClient().catch((error: Error) => {
    logger.error(error);
    return error;
  });
}

/**
 * Orderly shut down the server and dependencies.
 * First the http server, then the workers and finally the db connections
 *
 * @param server
 * @returns
 */
export async function shutdown(
  server: Server,
): Promise<Error[]> {
  const errors: (Error | void)[] = [];
  errors.push(await shutdownHttpServer(server));
  errors.push(await shutdownWorkers());
  errors.push(await closeDatabase());

  return errors.filter((e) => e !== undefined) as Error[];
}
