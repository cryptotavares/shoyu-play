import { ObjectId } from 'mongodb';

export type User = {
  id: string,
  chainId: number,
  address: string
  username?: string
  name?: string
  twitter?: string
};

export type DbUser = User & {
  _id: ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
  latestBlockUpdate: number;
};

export type UserInput = Omit<User, 'id' | 'chainId' | 'address'>;
