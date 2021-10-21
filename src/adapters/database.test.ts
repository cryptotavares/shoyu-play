import mongodb from 'mongodb';
import { DB_URI, DB_NAME } from '../configs';
import { initDb, getDbConnection, closeDbClient } from './database';
import StackedError from './StackedError';
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
import logger from './logger';

const mongoClientConnectMock = jest.fn();
const mongoClientCloseMock = jest.fn().mockImplementation(() => Promise.resolve());

const mongoDbCommandMock = jest.fn();
const mongoClientDbMock = jest.fn().mockReturnValue({
  command: mongoDbCommandMock,
});

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: mongoClientConnectMock,
    db: mongoClientDbMock,
    close: mongoClientCloseMock,
  })),
}));

const mockedmongodb = mongodb as jest.Mocked<typeof mongodb>;

jest.mock('./logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

const mockedLogger = logger;

describe('database adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initDb', () => {
    it('successfully initiates db connection', async () => {
      expect.assertions(8);

      await initDb();

      expect(mockedmongodb.MongoClient).toHaveBeenCalledTimes(1);
      expect(mockedmongodb.MongoClient).toHaveBeenCalledWith(DB_URI);
      expect(mongoClientConnectMock).toHaveBeenCalledTimes(1);
      expect(mongoClientDbMock).toHaveBeenCalledTimes(1);
      expect(mongoClientDbMock).toHaveBeenCalledWith(DB_NAME);
      expect(mongoDbCommandMock).toHaveBeenCalledTimes(1);
      expect(mongoDbCommandMock).toHaveBeenCalledWith({ ping: 1 });
      expect(mockedLogger.info).toHaveBeenCalledWith('Connected successfully to database');
    });

    it('Logs error but does not throw when fails to connect to db', async () => {
      expect.assertions(6);
      const clientConnectError = new Error('Failed to connect');

      mongoClientConnectMock.mockRejectedValueOnce(clientConnectError);

      await initDb();

      expect(mockedmongodb.MongoClient).toHaveBeenCalledTimes(1);
      expect(mockedmongodb.MongoClient).toHaveBeenCalledWith(DB_URI);
      expect(mongoClientConnectMock).toHaveBeenCalledTimes(1);
      expect(mongoClientDbMock).not.toHaveBeenCalled();
      expect(mongoDbCommandMock).not.toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenCalledWith(clientConnectError.stack);
    });
  });

  describe('closeDbClient', () => {
    it('successfully closes the db connection', async () => {
      expect.assertions(1);

      await closeDbClient();

      expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
    });

    it('throws a StackedError when fails to close db connection', async () => {
      expect.assertions(3);
      const clientCloseError = new Error('Failed to close');

      mongoClientCloseMock.mockRejectedValueOnce(clientCloseError);

      try {
        await closeDbClient();
        fail();
      } catch (error: any) {
        expect(mongoClientCloseMock).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(StackedError);
        expect(error.message).toEqual('Failed to close database connections');
      }
    });
  });

  describe('getDbConnection', () => {
    it('Returns an already initialised connection', async () => {
      expect.assertions(5);

      const db = await getDbConnection();

      expect(db).toHaveProperty('command');

      expect(mockedmongodb.MongoClient).not.toHaveBeenCalled();
      expect(mongoClientConnectMock).not.toHaveBeenCalled();
      expect(mongoClientDbMock).not.toHaveBeenCalled();
      expect(mongoDbCommandMock).not.toHaveBeenCalled();
    });
  });
});
