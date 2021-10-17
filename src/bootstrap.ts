import { Server } from 'http';
import * as initHttpService from './http-server';
import * as config from './configs';
import { shutdown } from './shutdown';
import { initDb } from './adapters/database';
import logger from './adapters/logger';
import { initDbConfig } from './adapters/databaseConfiguration';
import { initWorkers } from './workers';

let httpServer: Server;

/**
 * Method to shutdown any server initialized
 * @param reason shutdown reason
 */
async function shutdownService(reason: string): Promise<void> {
  try {
    logger.info(`Gracefully shutting down container: ${reason}`);

    await shutdown(httpServer);
  } catch (error) {
    logger.error(error as Error, 'An error occurred while trying to shutdown the server.');
  }
}

function onUncaughtExceptions(caughtException: any): void {
  logger.error(caughtException);

  shutdownService('An uncaught exception has been thrown.')
    .then(process.exit(1))
    .catch(process.exit(1));
}

function onUnhandledRejection(reason: any): void {
  logger.error(reason);
}

function onWarning(message: any): void {
  logger.warn(message);
}

function onSIGTERM(): void {
  shutdownService('Received SIGTERM signal.')
    .then(process.exit(0))
    .catch(process.exit(1));
}

/**
 * Bootstraps the server
 */
export function initService(): void {
  try {
    // Register handlers for process lifecycle events
    process.on('unhandledRejection', onUnhandledRejection);
    process.on('uncaughtException', onUncaughtExceptions);
    process.on('warning', onWarning);
    process.on('SIGTERM', onSIGTERM);

    initDb()
      .then(initDbConfig)
      .catch((error) => { logger.error(error, 'Failed init db connection'); });

    logger.info('Starting Node Workers');

    initWorkers();

    logger.info('Starting HTTP server');

    initHttpService.createServer()
      .then(server => {
        httpServer = server;
        httpServer.listen({ port: config.HTTP_SERVER_PORT }, () => {
          // And finally, start the HTTP server
          logger.info(`HTTP server ${config.APP_NAME} listening at port ${config.HTTP_SERVER_PORT}`);
        });
      })
      .catch(err => { throw err; });

  } catch (err) {
    logger.error(err as Error, 'An error occurred while service bootstrap.');

    process.exit(1);
  }
}
