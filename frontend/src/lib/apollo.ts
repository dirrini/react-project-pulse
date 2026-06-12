import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache
} from "@apollo/client";

import { getAuthToken }
  from "./authStorage";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL
});

const authLink = new ApolloLink(
  (operation, forward) => {
    const token = getAuthToken();

    operation.setContext(
      ({
        headers = {}
      }: {
        headers?: Record<string, string>;
      }) => ({
        headers: {
          ...headers,
          ...(token
            ? {
                authorization:
                  `Bearer ${token}`
              }
            : {})
        }
      })
    );

    return forward(operation);
  }
);

export const apolloClient =
  new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });
