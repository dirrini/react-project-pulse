import { prisma } from "../../lib/prisma";

export const projectResolver = {
  Query: {
    projects: async () => {
      return prisma.project.findMany({
        include: {
          tasks: true
        }
      });
    },
    project: async (
      _: unknown,
      args: {
        id: string;
      }
    ) => {
      return prisma.project.findUnique({
        where: {
          id: Number(args.id)
        },
        include: {
          tasks: true
        }
      });
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
      }
    ) => {
      return prisma.project.create({
        data: args.input,
        include: {
          tasks: true
        }
      });
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
      }
    ) => {
      return prisma.project.update({
        where: {
          id: Number(args.id)
        },
        data: args.input,
        include: {
          tasks: true
        }
      });
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
      }
    ) => {
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
    }
  }

};
