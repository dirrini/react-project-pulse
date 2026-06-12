import { prisma } from "../../lib/prisma";

export const projectResolver = {
  Query: {
    projects: async () => {
      return prisma.project.findMany();
    }
  }
};