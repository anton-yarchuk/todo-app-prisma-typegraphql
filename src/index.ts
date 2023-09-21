import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as tq from 'type-graphql';
import { SortOrder, Context, context } from './common';
import { TodoResolver } from './todos/TodoResolver';
import { UserResolver } from './users/UserResolver';
import { ListResolver } from './lists/ListResolver';
import { IntegrationResolver } from './integrations/IntegrationResolver';

(async () => {
  tq.registerEnumType(SortOrder, {
    name: 'SortOrder',
  });

  const schema = await tq.buildSchema({
    resolvers: [TodoResolver, UserResolver, ListResolver, IntegrationResolver],
    scalarsMap: [{ type: Date, scalar: tq.GraphQLTimestamp }],
    validate: true,
  });

  const server = new ApolloServer<Context>({ schema });

  // Mocking auth logic
  if (process.env.MOCK_USER_ID) {
    context.userId = process.env.MOCK_USER_ID;
  }

  const { url } = await startStandaloneServer(server, {
    context: async () => context,
  });

  console.log(`Server is ready: ${url}`);
})();
