import * as userRepository from '../repositories/user';
import * as userEventsRepository from '../repositories/userEvents';

export const initDbConfig = async () => {
  await Promise.all([
    userRepository.registerConfig(),
    userEventsRepository.registerConfig(),
  ]);
};
