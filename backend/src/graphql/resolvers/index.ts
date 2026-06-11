import { projectResolver } from "./projectResolver";
import { dashboardResolver } from "./dashboardResolver";

export const resolvers = {
  Query: {
    ...projectResolver.Query,
    ...dashboardResolver.Query,

    health: () =>
      "ProjectPulse API is running 🚀"
  }
};