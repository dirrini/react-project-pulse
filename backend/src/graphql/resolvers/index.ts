import { projectResolver } from "./projectResolver";
import { dashboardResolver } from "./dashboardResolver";
import { authResolver } from "./authResolver";

export const resolvers = {
  Query: {
    ...projectResolver.Query,
    ...dashboardResolver.Query,
    ...authResolver.Query,

    health: () =>
      "ProjectPulse API is running 🚀"
  },

  Mutation: {
    ...projectResolver.Mutation,
    ...authResolver.Mutation
  }
};
