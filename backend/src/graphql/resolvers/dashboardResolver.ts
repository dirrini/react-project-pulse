import { prisma } from "../../lib/prisma";
import {
  requireAuth,
  type GraphQLContext
} from "../context";

function projectScopeWhere(
  currentUser: {
    id: number;
    role: string;
  }
) {
  if (currentUser.role === "PROJECT_MANAGER") {
    return {
      users: {
        some: {
          userId: currentUser.id
        }
      }
    };
  }

  return {
    id: -1
  };
}

export const dashboardResolver = {
  Query: {
    dashboardStats: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const currentUser =
        requireAuth(context);
      const projectWhere =
        projectScopeWhere(currentUser);
      const taskWhere = {
        project: projectWhere
      };

      const [
        totalProjects,
        totalTasks,
        completedTasks,
        teamMembers
      ] = await Promise.all([
        prisma.project.count({
          where: projectWhere
        }),
        prisma.task.count({
          where: taskWhere
        }),
        prisma.task.count({
          where: {
            ...taskWhere,
            status: "DONE"
          }
        }),
        prisma.projectUser.findMany({
          where: {
            project: projectWhere
          },
          distinct: ["userId"],
          select: {
            userId: true
          }
        })
      ]);

      return {
        totalProjects,
        totalTasks,
        completedTasks,
        teamMembers: teamMembers.length
      };
    }
  }
};
