import { ApolloServer }
  from "@apollo/server";

import { expressMiddleware }
  from "@apollo/server/express4";

import { app } from "./app";

import { typeDefs }
  from "./src/graphql/typeDefs";

import { resolvers }
  from "./src/graphql/resolvers";

async function startServer() {
  const apolloServer =
    new ApolloServer({
      typeDefs,
      resolvers
    });

  await apolloServer.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer)
  );

  app.listen(4000, () => {
    console.log(
      "🚀 GraphQL running on http://localhost:4000/graphql"
    );
  });
}

startServer();