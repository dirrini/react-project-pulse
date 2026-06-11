export const projectSchema = `#graphql

  enum ProjectStatus {
    ON_TRACK
    AT_RISK
    COMPLETED
  }

  type Project {
    id: ID!
    name: String!
    description: String!
    progress: Int!
    status: ProjectStatus!
  }

  extend type Query {
    projects: [Project!]!
  }

`;