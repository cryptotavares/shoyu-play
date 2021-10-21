# Shoyu-play service
Shoyu-play service acts as a backend service for an identity management dapp.

The project is based on three services, a node server exposing a GraphQl  API, a database (mongodb) storing the state of the users and storing an event store (replicating the events emitted by the dapp) and a set of worker threads (one per supported network) to index the dapp events and persist them into mongodb.

At the moment the only networks supported are:
 * Kovan
 * Rinkeby
 * local network (for local development purposes)

Built with [Typescript](https://www.typescriptlang.org/docs/) :blue_heart:

## Local development
To run the project locally you first need to install dependencies:

```bash
yarn install
```

Ensure that you have a local blockchain running. We advise using hardhat:

```bash
npx hardhat node
```

Set the correct environment variables in order for the server to connect to the local network:
* DEFAULT_ADDRESS
* DEFAULT_CHAIN_ID
* PRIVATE_KEY (owner of the contract)

Finally you just need to execute:

```bash
docker-compose up
```

### Dev mode

First bring up mongo and then start the dev mode:

```bash
docker-compose up mongo
yarn build
yarn start
```

### Linting and Build

#### Type check
```bash
yarn type-check
```
#### Eslint
```bash
yarn eslint
```
#### Dockerfile lint
```bash
yarn dockerlint
```

#### Typescript build
```bash
yarn build
```

## Connect to Kovan and Rinkeby
Add a .env file with the configuration required to connect to Kovan and Rinkeby. I decided to go with dotenv because it is easier for bootstrapping the server locally to connect to both kovan and rinkeby (so this is for demonstration purposes only).

Variables that .env should contain:
```
// wallet that deployed the contract private key (assuming same wallet for all networks)
PRIVATE_KEY

// Infura project keys.
INFURA_API_KEY
INFURA_PROJECT_ID

// Kovan contract address and a boolean stating if the server should ne connecting to Kovan or not
KOVAN_ADDRESS
KOVAN_ENABLED

// Rinkeby contract address and a boolean stating if the server should ne connecting to Rinkeby or not
RINKEBY_ADDRESS
RINKEBY_ENABLED

NODE_ENV=production
```

First bring up mongo and then start the in production mode:

```bash
docker-compose up mongo
yarn build
APP_ENV=production yarn start
```

Do not worry about your database being empty. If there are already events to be indexed, you just need to set the proper <NETWORK>_BLOCK_DEPLOY env var (use .env for it), and the indexer will start processing all the events starting at that block. It will then rebuild the data on the db if needed.

## Tests
To be included

## CHALLENGE FEEDBACK
I found out the challenge very interesting and I feel that I have learn a lot from doing it. As I had said previously, although I have a lot of experience with Node/Typescript and creating micro services, I had never created a GraphQl server, neither created a server to interact with a smart contracts.

### Major decisions:
#### Tech used:
* **Typescript**: I am comfortable using it and I belive that it speeds up the development process. That being said, I have struggled a bit with the lack of "support" to use typescript with GraphQl and with Node worker threads. I would need more time to proper integrate tools like nodemon for an improved developer experience.
* **MongoDb**: Decided to go with a mongoDb as a database. No praticular reason rather than being more used to it (when comparing with firestore). Things that I would need to improve would be to make use of transactional sessions (wich is only availble for a cluster with replica sets.. It would be the minimum for a production deployment, but I didn't think it was necessary for the purpose of this challenge)
* **Pino**: Usually I prefer to build my own logger formatter (or just extend the logger formatter of the ingestion service that we might be using). For standalone services that are not sending the logs into any ingestion service, I usually go with Pino as it is a very low overheaded logger. As simple as it gets.
* **ethers**: Used ethers instead of web3 because it was what was referenced in the challenge documentation. I don't have an opinion yet on which one I would rather use. (Although ethers documentation seems rather poor.. very few examples)

#### Design decisions
The server is structured in the following maner:
* adapters - wrappers to initialize external dependencies.
* configs - configuration files
* graphql - GraphQl related files (queries and mutations)
* http-server - where we expose bootstraping the http server
* repositories - holds the logic to interact with our business entities (in this case Users and UserEvents)
* types - service entities.
* utils - utilitarian generic methods.
* workers - all logic related with the workers (init, shutdown, business logic)
* bootstrap - file where the entire service bootstrapping is orchestrated (database connections, workers, http server).
* shutdown - file where the shutdown is orchestrated (database connections, workers, http server)
index - entry point - where it all starts.

**Workers**:
The service will spawn one worker per network that it will index. Currently it is setted to spawn 2 workers (Kovan and Rinkeby) if started in Production mode.

**Improvements**:
There are a lot of improvements to be made. From logging, to better management of workers concurrency (thinking in a world where more than one server instance is up and running.. probably I would introduce a queueing system for it).
As for the GraphQl, I would probably try out using [typegraphql](https://typegraphql.com/) and [typegoose](https://typegoose.github.io/typegoose/). It seems to have better typescript support. Or I would even use [nestJs](https://nestjs.com/) for better standardization.

I would also improve documentation and test coverage (as well as coverage report generation).

### SMART CONTRACT UPDATED

I have noticed that the smart contract event emitted was emmiting the `string indexed username`.
Indexed string properties will be hashed and end up on the topics. This is good for filtering.. but bad if we want to know the value that was emitted.

So I had 2 possible solutions:
1. On the updateMe/signUp mutations, we would create a store for `username:hash`. That way we would be able to decypher the hash that was present on the emit event and recreate the user state. This solution had one problem, which was in the case of a catastrophic event where we would loose the `username:hash` reference and our entire database, we would not be able to rebuild the event history from scratch (or it would be extremely difficult).
2. Update the smart contract so that it emits the `username` twice. One as an `string indexed` and another one as just a `string`. This way can still filter events by the username hash, and have a reference to it decrypted value.

Changes made to the smart contract events:
```js
    event CreateIdentity(address indexed addr, string indexed username, string dataUserName, string name, string twitter);
    event UpdateIdentity(address indexed addr, string indexed username, string dataUserName, string name, string twitter);
    event DeleteIdentity(address indexed addr, string indexed username);
```
