import Express from 'express';
import helmet from 'helmet';
import http, { Server } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { typeDefs, resolvers } from '../graphql';
import { cors } from './middlewares';
import { IS_PRODUCTION } from '../configs';
import StackedError from '../adapters/StackedError';
import logger from '../adapters/logger';
import { getAddressFromAuthSign } from '../adapters/ethers';

export async function createServer(): Promise<Server> {
  const app = Express();

  // Register Middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors);

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      if (req.body.operationName === 'IntrospectionQuery') {
        return;
      }

      const chainId = req.headers['chain-id'] || '';
      const authSignature = req.headers['auth-signature'] || '';

      if (!chainId) {
        logger.debug(req.headers);
        throw new StackedError('Missing network id');
      }

      if (!authSignature) {
        return { chainId: parseInt(chainId as string, 10) };
      }

      return {
        chainId: parseInt(chainId as string, 10),
        address: getAddressFromAuthSign(authSignature as string),
      };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ...(!IS_PRODUCTION ? [ApolloServerPluginLandingPageGraphQLPlayground()] : []),
    ],
  });

  await server.start();

  server.applyMiddleware({ app, path: '/*' });

  return httpServer;
}
