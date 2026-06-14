export const authSchema = `#graphql

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    users: [User!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    role: String
  }

  input UpdateMyPasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  extend type Mutation {
    login(
      email: String!
      password: String!
    ): AuthPayload!

    createUser(
      input: CreateUserInput!
    ): User!

    updateUser(
      id: ID!
      input: UpdateUserInput!
    ): User!

    updateMyPassword(
      input: UpdateMyPasswordInput!
    ): Boolean!
  }

`;
