import { getDbConnection } from '../adapters/database';
import { getContract } from '../adapters/ethers';
import logger from '../adapters/logger';
import StackedError from '../adapters/StackedError';
import { DbUser, User, UserInput } from '../types/user';
import { UserEvent } from '../types/userEvent';

const USER_DB_COLLECTION = 'users';

/**
 * Setup collection configuration (in this case specific indexes)
 */
export const registerConfig = async () => {
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<DbUser>(USER_DB_COLLECTION);

    await dbCollection.createIndex({ id: 1 }, { unique: true });
  } catch (error) {
    throw new StackedError('Failed to register database config', error);
  }
};

/**
 * Maps a database user into a user
 * @param databaseUser
 * @returns
 */
const dbUserToUserMapper = (databaseUser : DbUser): User => {
  return {
    id: databaseUser.id,
    chainId: databaseUser.chainId,
    address: databaseUser.address,
    name: databaseUser.name,
    username: databaseUser.username,
    twitter: databaseUser.twitter,
  };
};

export const getUserById = async ( id: string ): Promise<User | undefined > => {
  let dbUser;
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<DbUser>(USER_DB_COLLECTION);

    dbUser = await dbCollection.findOne({ id });
  } catch (error) {
    throw new StackedError('Failed to fetch user from database', error);
  }

  if (!dbUser) {
    logger.warn('User not found');
    return;
  }

  return dbUserToUserMapper(dbUser);
};

export const upsertDbUserFromEventUser = async (user: User, userEvent: UserEvent): Promise<void> => {
  let result;
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<DbUser>(USER_DB_COLLECTION);

    const now = new Date();
    result = await dbCollection.updateOne(
      { id: user.id },
      {
        $set: {
          ...user,
          updatedAt: now,
          latestBlockUpdate: userEvent.blockNumber,
        },
      },
      { upsert: true },
    );

  } catch (error) {
    throw new StackedError('Failed to persist user', error);
  }

  if (!result.acknowledged) {
    throw new StackedError('Failed to persist user.');
  }

  return;
};

export const deleteById = async (id: string) => {
  let result;
  try {
    const db = await getDbConnection();
    const dbCollection = db.collection<DbUser>(USER_DB_COLLECTION);

    result = await dbCollection.deleteOne({ id });

  } catch (error) {
    throw new StackedError('Failed to delete user from db', error);
  }

  if (result.deletedCount !== 1) {
    throw new StackedError('Failed to delete user from db. Delete count different than 1');
  }

  return;
};

export const createUser = async (user: User): Promise<User> => {
  try {
    const contract = getContract(user.chainId);
    const trxResponse = await contract.createIdentity(user.address, user.username, user.name, user.twitter);
    const receipt = await trxResponse.wait();

    logger.debug(receipt, 'trx receipt');

    if (!receipt.status) {
      throw new StackedError('Transaction was reverted') ;
    }

    return user;
  } catch (error) {
    throw new StackedError('Failed to persist user', error);
  }
};

export const updateUserById = async (
  chainId: number,
  address: string,
  updateUser: UserInput,
): Promise<User> => {
  try {
    const contract = getContract(chainId);
    const trxResponse = await contract.updateIdentity(
      address,
      updateUser.username,
      updateUser.name,
      updateUser.twitter,
    );
    const receipt = await trxResponse.wait();

    if (!receipt.status) {
      throw new StackedError('Transaction was reverted') ;
    }

    logger.debug(receipt, 'trx receipt');

    return {
      id: `${chainId}:${address}`,
      address,
      chainId,
      name: updateUser.name,
      username: updateUser.username,
      twitter: updateUser.twitter,
    };
  } catch (error) {
    throw new StackedError('Failed to update user', error);
  }
};
