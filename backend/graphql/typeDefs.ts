export const typeDefs = `#graphql

  type Project {
    id: ID!
    name: String!
    description: String!
    progress: Int!
  }

  type Query {
    health: String!
    projects: [Project!]!
  }

`;