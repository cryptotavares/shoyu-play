import { UserInput } from '../types/user';
import StackedError from '../adapters/StackedError';
import * as userRepository from '../repositories/user';
import logger from '../adapters/logger';
import { validate as validateInput } from '../utils/jsonValidation';

const mutationUserInputSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    name: { type: 'string' },
    twitter: { type: 'string' },
  },
};

const findUserById = async (id: string) => {
  const existingUser = await userRepository.getUserById(id);

  if (!existingUser) {
    logger.error(new StackedError('User not found'));

    return;
  }

  return existingUser;
};

const resolvers = {
  Query: {
    user: async (
      _parent: any,
      args: { address: string },
      { chainId }: { chainId: number },
    ) => {
      const id = `${chainId}:${args.address}`;
      return findUserById(id);
    },
    me: async (
      _parent: any,
      _args: any,
      { chainId, address }: { chainId: number, address?: string },
    ) => {
      const id = `${chainId}:${address}`;
      return findUserById(id);
    },
  },

  Mutation: {
    signUp: async (
      _parent: any,
      args: { input: UserInput },
      { chainId, address }: { chainId: number, address?: string },
    ) => {
      if (!address) {
        throw new StackedError('Missing address');
      }

      validateInput(mutationUserInputSchema, args.input);

      const id = `${chainId}:${address}`;
      const user = { ...args.input, id, chainId, address };
      const existingUser = await userRepository.getUserById(id);

      if (existingUser) {
        throw new StackedError('User already exists');
      }

      await userRepository.createUser(user);

      return user;
    },
    updateMe: async (
      _parent: any,
      args: { input: UserInput },
      { chainId, address }: { chainId: number, address?: string },
    ) => {
      if (!address) {
        throw new StackedError('Missing address');
      }

      logger.info(address, 'ADDRESS');

      validateInput(mutationUserInputSchema, args.input);

      await userRepository.updateUserById(chainId, address, args.input);
    },
  },
};

export default resolvers;
