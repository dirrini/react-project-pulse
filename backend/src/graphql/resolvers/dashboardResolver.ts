import { prisma } from "../../lib/prisma";
import {
  requireAuth,
  type GraphQLContext
} from "../context";

export const dashboardResolver = {
  Query: {
    dashboardStats: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const [
        totalProjects,
        totalTasks,
        completedTasks
      ] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({
          where: {
            status: "DONE"
          }
        })
      ]);

      return {
        totalProjects,
        totalTasks,
        completedTasks,
        teamMembers: 0
      };
    }
  }
};
