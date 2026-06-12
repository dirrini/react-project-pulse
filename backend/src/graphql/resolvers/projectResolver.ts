import { prisma } from "../../lib/prisma";

export const projectResolver = {
  Query: {
    projects: async () => {
      return prisma.project.findMany();
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
        data: args.input
      });
    }
  }

};