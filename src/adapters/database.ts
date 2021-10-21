/* eslint-disable @typescript-eslint/no-unsafe-return */
import { MongoClient, Db, MongoError } from 'mongodb';
import { DB_URI, DB_NAME } from '../configs';
import logger from './logger';
import StackedError from './StackedError';

let dbClient: MongoClient;
let db: Db;

export async function initDb(): Promise<void> {
  try {
    dbClient = new MongoClient(DB_URI);
    await dbClient.connect();

    db = dbClient.db(DB_NAME);

    await db.command({ ping: 1 });
    logger.info('Connected successfully to database');
  } catch (err: any) {
    logger.error(err.stack);
  }
}

export async function closeDbClient(): Promise<void> {
  if (dbClient) {
    await dbClient.close()
      .catch((err: MongoError) => {
        logger.error(err);
        throw new StackedError('Failed to close database connections', err);
      });
  }
}

export async function getDbConnection(): Promise<Db> {
  if (!db) {
    await initDb();
  }

  return db;
}

