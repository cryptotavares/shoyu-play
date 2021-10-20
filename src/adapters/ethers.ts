import { ContractInterface, ethers, providers } from 'ethers';
import identityManangerAbi from '../abi/identityManagerAbi.json';
import { PRIVATE_KEY, NETWORKS, SIGN_MESSAGE, INFURA_API_KEY, INFURA_PROJECT_ID } from '../configs';
import logger from './logger';
import StackedError from './StackedError';

const ChainProviderMap = new Map<number, ethers.Contract>();

const getContractFromProvider = (
  provider: providers.Provider,
  contractAddress: string,
  privateKey: string,
) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, identityManangerAbi as ContractInterface, wallet);
};

const getNetworkConfig = (chainId: number) => {
  const networkConfig = Object.values(NETWORKS).find(value => value.chainId === chainId);

  if (!networkConfig) {
    throw new StackedError('No contract address for given chainId');
  }

  if (!networkConfig.enabled) {
    throw new StackedError('Network not enabled');
  }

  return networkConfig;
};

export const getContract = (chainId: number) => {
  const storedContract = ChainProviderMap.get(chainId);

  if (storedContract) {
    return storedContract;
  }

  const contractAddress = getNetworkConfig(chainId);

  logger.debug('Creating new contract instance');

  switch (chainId) {
    case NETWORKS.default.chainId: {
      const contract = getContractFromProvider(
        new ethers.providers.JsonRpcProvider(),
        contractAddress.address,
        PRIVATE_KEY,
      );

      ChainProviderMap.set(chainId, contract);
      return contract;
    }
    case NETWORKS.kovan.chainId:
    case NETWORKS.rinkeby.chainId: {
      const contract = getContractFromProvider(
        new ethers.providers.InfuraProvider(
          chainId,
          { projectId: INFURA_PROJECT_ID, projectSecret: INFURA_API_KEY },
        ),
        contractAddress.address,
        PRIVATE_KEY,
      );

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
