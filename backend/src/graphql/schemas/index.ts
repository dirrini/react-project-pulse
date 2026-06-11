import { projectSchema } from "./projectSchema";
import { dashboardSchema } from "./dashboardSchema";

export const typeDefs = `#graphql

  type Query {
    health: String!
  }

  ${projectSchema}

  ${dashboardSchema}

`;