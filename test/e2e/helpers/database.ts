import { getDbConnection } from '../../../src/adapters/database';
import { DbUser } from '../../../src/types/user';
import { DbUserEvent } from '../../../src/types/userEvent';
import { USER_EVENTS_DB_COLLECTION } from '../../../src/repositories/userEvents';
import { USER_DB_COLLECTION } from '../../../src/repositories/user';
import { ObjectId } from 'mongodb';

export const mockUser = {
  id: '1337:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  chainId: 1337,
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  username: 'fakeUsername',
  name: 'fakeName',
  twitter: '@fakeTwitter',
  latestBlockUpdate: 1000000,
};

export const mockUserAuthSign = '0x7feb3e20d333861bda6afffe54f35d3552021504e2894d3573e0645852320c7217c6a3021db2495da63239ad6c3457b79b64a617b9650f259ab4ad40bbd4ad801c';

export async function createUser(
  dbUser?: Partial<DbUser>,
): Promise<ObjectId | string> {
  const db = await getDbConnection();
  const dbCollection = db.collection<DbUser>(USER_DB_COLLECTION);

  const now = new Date();

  await dbCollection.deleteOne({ id: mockUser.id });
  const result = await dbCollection.insertOne({
    ...mockUser,
    createdAt: now,
    updatedAt: now,
    ...dbUser,
  });

  return result.insertedId;
}


export async function resetDb(): Promise<void> {
  const db = await getDbConnection();
  const userDbCollection = db.collection<DbUser>(USER_DB_COLLECTION);
  const userEventsDbCollection = db.collection<DbUserEvent>(USER_EVENTS_DB_COLLECTION);

  try {
    await userDbCollection.deleteMany({});
    await userEventsDbCollection.deleteMany({});
  // eslint-disable-next-line no-empty
  } catch (error) {}
}
