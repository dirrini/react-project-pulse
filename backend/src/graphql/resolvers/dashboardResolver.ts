import { prisma } from "../../lib/prisma";

export const dashboardResolver = {
  Query: {
    dashboardStats: async () => {
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
