import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { app } from "./app";
import { typeDefs } from "./graphql/schemas";
import { resolvers } from "./graphql/resolvers";
import {
  createGraphQLContext,
  type GraphQLContext
} from "./graphql/context";

async function startServer() {
  const apolloServer =
    new ApolloServer<GraphQLContext>({
      typeDefs,
      resolvers
    });

  await apolloServer.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }) =>
        createGraphQLContext(req)
    })
  );

  app.listen(4000, () => {
    console.log(
      "🚀 GraphQL running on http://localhost:4000/graphql"
    );
  });
}

startServer();
