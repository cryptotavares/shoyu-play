const { ethers } = require("ethers");
// const identityManangerAbi = require('./src/abi/identityManagerAbi.json');

const provider = new ethers.providers.JsonRpcProvider();

const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const wallet = new ethers.Wallet(privateKey,provider);

// const contract = new ethers.Contract('0x5fbdb2315678afecb367f032d93f642f64180aa3', identityManangerAbi, wallet);

const test = async () => {
  const blockNumber = await provider.getBlockNumber() + 1;
  console.log(blockNumber);

  // const events = await contract.queryFilter({}, blockNumber);
  // console.log('QUERY', events);

  // contract.on('CreateIdentity', (event) => {
  //   console.log('Listener EVENT', event);
  // });

  console.log('CORRECT ADDRESS', wallet.address);

  const originalMessage = "I'd like to sign in";
  const message = ethers.utils.hashMessage(originalMessage);

  const stringMessage = await wallet.signMessage(ethers.utils.arrayify(message));
  const bytesMessage = await wallet.signMessage(message);

  console.log('STRING MESSAGE', stringMessage);
  console.log('BYTES', bytesMessage);

  const stringAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(message), stringMessage);
  const bytesAddress = ethers.utils.verifyMessage(message, bytesMessage);

  console.log('STRING ADDRESS', stringAddress);
  console.log('BYTES ADDRESS', bytesAddress);


  // const trxResponse = await contract.createIdentity('0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 'myUserName', 'my Name', '@helloTwitter');
  // console.log('trxResponse', trxResponse);
  // await trxResponse.wait();

  // const deleteTrxResponse = await contract.deleteIdentity('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  // const moreEvents = await contract.queryFilter({}, blockNumber);
  // await Promise.all(moreEvents.map(async event => {
  //   const receipt = await event.getTransactionReceipt();

  //   console.log('EVENT RECEIPT', receipt);
  // }));

  // await deleteTrxResponse.wait();

  // const finalEvents = await contract.queryFilter({}, blockNumber);
  // console.log('QUERY', finalEvents);

//   return receipt;
};

test().then(result => {
  console.log(result);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
