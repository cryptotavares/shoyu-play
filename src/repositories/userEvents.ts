import { getDbConnection } from '../adapters/database';
import logger from '../adapters/logger';
import StackedError from '../adapters/StackedError';
import { DbUserEvent, UserEvent } from '../types/userEvent';
import * as userRepository from './user';

export const USER_EVENTS_DB_COLLECTION = 'userEvents';

/**
 * Setup collection configuration (in this case specific indexes)
 */
export const registerConfig = async () => {
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<UserEvent>(USER_EVENTS_DB_COLLECTION);

    await dbCollection.createIndex({ chainId: 1 });
    await dbCollection.createIndex({ address: 1, chainId: 1 });
    await dbCollection.createIndex({ blockNumber: 1 }, { name: 'blockNumber_1' });
  } catch (error) {
    throw new StackedError('Failed to register database config', error);
  }
};

const userEventToDbMapper = (userEvent: UserEvent): Omit<DbUserEvent, '_id'> => {
  if (!userEvent.args) {
    throw new StackedError('Could not identify address');
  }

  return { ...userEvent, address: userEvent.args[0] };
};

const replicateEventOperationsToUser = async (userEvents: UserEvent[]) => {
  for (const event of userEvents) {
    if (!event.args) {
      return;
    }

    switch (event.event) {
      case 'CreateIdentity':
      case 'UpdateIdentity': {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [ address, _indexedUsername, username, name, twitter ] = event.args;

        await userRepository.upsertDbUserFromEventUser({
          address,
          id: `${event.chainId}:${address}`,
          chainId: event.chainId,
          username,
          name,
          twitter,
        }, event);

        return;
      }
      case 'DeleteIdentity': {
        const [ address ] = event.args;
        await userRepository.deleteById(`${event.chainId}:${address}`);
        return;
      }
      default: {
        logger.error('Could not identify event type');
      }
    }
  }
};

export const getLatestEventByChainId = async (chainId: number): Promise<UserEvent | undefined> => {
  let dbEvent: UserEvent;
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<UserEvent>(USER_EVENTS_DB_COLLECTION);

    [dbEvent] = await dbCollection.find({ chainId }).sort({ blockNumber: -1 }).limit(1).toArray();

  } catch (error) {
    throw new StackedError('Failed to fetch event from database', error);
  }

  if (!dbEvent) {
    logger.warn('No events in the DB');
    return;
  }

  return dbEvent;
};

export const createEvents = async (userEvents: UserEvent[]): Promise<void> => {
  const db = await getDbConnection();
  const dbCollection = db.collection<UserEvent>(USER_EVENTS_DB_COLLECTION);

  try {
    const results = await dbCollection.bulkWrite(
      userEvents.map(event => ({
        updateOne: {
          filter: { blockNumber: event.blockNumber },
          update: { $set: userEventToDbMapper(event) },
          upsert: true,
          hint: 'blockNumber_1',
        },
      })),
    );

    await replicateEventOperationsToUser(userEvents);

    logger.debug(results);
  } catch (error) {
    const err = new StackedError('Failed to persist user events', error);
    logger.error(err);
    throw err;
  }
};
