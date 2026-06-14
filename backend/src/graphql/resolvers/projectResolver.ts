import {
  requireProjectManager,
  type GraphQLContext
} from "../context";
import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma";

const projectInclude = {
  tasks: true,
  users: {
    include: {
      user: true
    }
  }
};

function mapProjectUsers<
  T extends {
    users?: Array<{
      user: unknown;
    }>;
  }
>(project: T | null) {
  if (!project) {
    return project;
  }

  return {
    ...project,
    users:
      project.users?.map(
        (projectUser) => projectUser.user
      ) ?? []
  };
}

export const projectResolver = {
  Query: {
    projects: async () => {
      const projects =
        await prisma.project.findMany({
          include: projectInclude
        });

      return projects.map(mapProjectUsers);
    },
    project: async (
      _: unknown,
      args: {
        id: string;
      }
    ) => {
      const project =
        await prisma.project.findUnique({
        where: {
          id: Number(args.id)
        },
        include: projectInclude
      });

      return mapProjectUsers(project);
    }
  },
  Mutation: {
    createProject: async (
      _: unknown,
      args: {
        input: {
          name: string;
          description: string;
          progress: number;
          status: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      const project =
        await prisma.project.create({
        data: args.input,
        include: projectInclude
      });

      return mapProjectUsers(project);
    },
    updateProject: async (
      _: unknown,
      args: {
        id: string;
        input: {
          name?: string;
          description?: string;
          progress?: number;
          status?: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      const project =
        await prisma.project.update({
        where: {
          id: Number(args.id)
        },
        data: args.input,
        include: projectInclude
      });

      return mapProjectUsers(project);
    },
    createTask: async (
      _: unknown,
      args: {
        input: {
          projectId: string;
          title: string;
          description?: string;
          status: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      return prisma.task.create({
        data: {
          title: args.input.title,
          description:
            args.input.description,
          status: args.input.status,
          projectId: Number(
            args.input.projectId
          )
        }
      });
    },
    addProjectUser: async (
      _: unknown,
      args: {
        input: {
          projectId: string;
          userId: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      const user =
        await prisma.user.findUnique({
          where: {
            id: Number(args.input.userId)
          }
        });

      if (
        !user ||
        (
          user.role !== "PROJECT_MANAGER" &&
          user.role !== "MEMBER"
        )
      ) {
        throw new GraphQLError(
          "User cannot be assigned to projects.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      await prisma.projectUser.upsert({
        where: {
          projectId_userId: {
            projectId: Number(
              args.input.projectId
            ),
            userId: Number(args.input.userId)
          }
        },
        update: {},
        create: {
          projectId: Number(
            args.input.projectId
          ),
          userId: Number(args.input.userId)
        }
      });

      const project =
        await prisma.project.findUnique({
          where: {
            id: Number(args.input.projectId)
          },
          include: projectInclude
        });

      return mapProjectUsers(project);
    },
    removeProjectUser: async (
      _: unknown,
      args: {
        input: {
          projectId: string;
          userId: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      await prisma.projectUser.deleteMany({
        where: {
          projectId: Number(
            args.input.projectId
          ),
          userId: Number(args.input.userId)
        }
      });

      const project =
        await prisma.project.findUnique({
          where: {
            id: Number(args.input.projectId)
          },
          include: projectInclude
        });

      return mapProjectUsers(project);
    }
  }

};
