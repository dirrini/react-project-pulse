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
    externalCode: String
    name: String!
    description: String!
    progress: Int!
    status: ProjectStatus!
    tasks: [Task!]!
    users: [User!]!
    products: [Product!]!
  }

  type Product {
    id: ID!
    externalCode: String
    status: String!
    vendor: String!
    materialCode: String!
    quantity: Float!
    materialDescription: String!
    deliveryDate: String!
    projectId: ID!
  }

  extend type Query {
    projects: [Project!]!
    project(id: ID!): Project
    timelineProjects: [Project!]!
  }

  input CreateProjectInput {
    externalCode: String
    name: String!
    description: String!
    progress: Int!
    status: String!
  }

  input UpdateProjectInput {
    externalCode: String
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

  input CreateProductInput {
    projectId: ID!
    status: String!
    vendor: String!
    materialCode: String!
    quantity: Float!
    materialDescription: String!
    deliveryDate: String!
  }

  input UpdateProductInput {
    status: String
    vendor: String
    materialCode: String
    quantity: Float
    materialDescription: String
    deliveryDate: String
  }

  input UpsertExternalProductInput {
    projectExternalCode: String!
    externalCode: String!
    status: String!
    vendor: String!
    materialCode: String!
    quantity: Float!
    materialDescription: String!
    deliveryDate: String!
  }

  type Mutation {
    createProject(
      input: CreateProjectInput!
    ): Project!

    updateProject(
      id: ID!
      input: UpdateProjectInput!
    ): Project!

    deleteProject(
      id: ID!
    ): Boolean!

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

    createProduct(
      input: CreateProductInput!
    ): Product!

    updateProduct(
      id: ID!
      input: UpdateProductInput!
    ): Product!

    deleteProduct(
      id: ID!
    ): Boolean!

    upsertExternalProduct(
      input: UpsertExternalProductInput!
    ): Product!
  }

`;
