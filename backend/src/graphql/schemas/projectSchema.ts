export const projectSchema = `#graphql

  enum ProjectStatus {
    ON_TRACK
    AT_RISK
    COMPLETED
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    projectId: ID!
    users: [TaskUser!]!
  }

  type TaskUser {
    id: ID!
    user: User!
    status: TaskStatus!
    estimatedStartDate: String!
    estimatedEndDate: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String!
    progress: Int!
    status: ProjectStatus!
    tasks: [Task!]!
    users: [User!]!
  }

  extend type Query {
    projects: [Project!]!
    project(id: ID!): Project
  }

  input CreateProjectInput {
    name: String!
    description: String!
    progress: Int!
    status: String!
  }

  input UpdateProjectInput {
    name: String
    description: String
    progress: Int
    status: String
  }

  input CreateTaskInput {
    projectId: ID!
    title: String!
    description: String
    status: String!
    users: [TaskUserInput!]!
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: String
    users: [TaskUserInput!]
  }

  input TaskUserInput {
    userId: ID!
    status: String!
    estimatedStartDate: String!
    estimatedEndDate: String!
  }

  input AddProjectUserInput {
    projectId: ID!
    userId: ID!
  }

  input RemoveProjectUserInput {
    projectId: ID!
    userId: ID!
  }

  type Mutation {
    createProject(
      input: CreateProjectInput!
    ): Project!

    updateProject(
      id: ID!
      input: UpdateProjectInput!
    ): Project!

    createTask(
      input: CreateTaskInput!
    ): Task!

    updateTask(
      id: ID!
      input: UpdateTaskInput!
    ): Task!

    addProjectUser(
      input: AddProjectUserInput!
    ): Project!

    removeProjectUser(
      input: RemoveProjectUserInput!
    ): Project!
  }

`;
