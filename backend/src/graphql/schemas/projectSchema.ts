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

  input CreateProjectInput {
    name: String!
    description: String!
    progress: Int!
    status: String!
  }

  type Mutation {
    createProject(
      input: CreateProjectInput!
    ): Project!
  }

`;