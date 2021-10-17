import { Result } from 'ethers/lib/utils';
import { ObjectId } from 'mongodb';

export type UserEvent = {
  blockNumber: number,
  blockHash: string,
  transactionIndex: number,
  removed: boolean,
  data: string,
  topics: string[],
  transactionHash: string,
  logIndex: number,
  event?: string,
  args?: Result,
  chainId: number,
};

export type DbUserEvent = UserEvent & {
  _id: ObjectId | string;
  address: string;
};

