import { ContractInterface, ethers } from 'ethers';
import identityManangerAbi from '../abi/identityManagerAbi.json';
import { PRIVATE_KEY, NETWORKS, SIGN_MESSAGE } from '../configs';
import logger from './logger';
import StackedError from './StackedError';

const ChainProviderMap = new Map<number, ethers.Contract>();

export const getContract = (chainId: number) => {
  const storedContract = ChainProviderMap.get(chainId);

  if (storedContract) {
    return storedContract;
  }

  const contractAddress = Object.values(NETWORKS).find(value => value.chainId === chainId);

  if (!contractAddress) {
    throw new StackedError('No contract address for given chainId');
  }

  logger.debug('Creating new contract instance');

  switch (chainId) {
    case NETWORKS.default.chainId: {
      const provider = new ethers.providers.JsonRpcProvider();
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      const contract = new ethers.Contract(contractAddress.address, identityManangerAbi as ContractInterface, wallet);

      ChainProviderMap.set(chainId, contract);
      return contract;
    }
    default: throw new StackedError('Missing chainId');
  }
};

export const getAddressFromAuthSign = (authSignature: string) => {
  const message = ethers.utils.hashMessage(SIGN_MESSAGE);
  return ethers.utils.verifyMessage(message, authSignature);
};
