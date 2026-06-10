import React from "react";

import ReactDOM from "react-dom/client";

import { ApolloProvider } from "@apollo/client/react";

import { apolloClient }
  from "./lib/apollo";

import App from "./App";

// @ts-ignore
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ApolloProvider
      client={apolloClient}
    >
      <App />
    </ApolloProvider>
  </React.StrictMode>
);