import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import * as tq from "type-graphql";
import { SortOrder, Context, context } from "./common";

(async () => {
  tq.registerEnumType(SortOrder, {
    name: "SortOrder",
  });

  const schema = await tq.buildSchema({
    resolvers: [],
    scalarsMap: [{ type: Date, scalar: tq.GraphQLTimestamp }],
  });

  const server = new ApolloServer<Context>({ schema });

  const { url } = await startStandaloneServer(server, {
    context: async () => context,
  });

  console.log(`Server is ready: ${url}`);
})();
