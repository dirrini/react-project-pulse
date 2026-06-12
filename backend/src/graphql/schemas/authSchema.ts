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
  }

  extend type Mutation {
    login(
      email: String!
      password: String!
    ): AuthPayload!
  }

`;
