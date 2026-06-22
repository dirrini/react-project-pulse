import {
  requireAuth,
  requireUserManager,
  requireProjectManager,
  type GraphQLContext
} from "../context";
import { GraphQLError } from "graphql";
import { prisma } from "../../lib/prisma";

const projectInclude = {
  tasks: {
    include: {
      users: {
        include: {
          user: true
        }
      }
    }
  },
  users: {
    include: {
      user: true
    }
  }
};

const taskInclude = {
  users: {
    include: {
      user: true
    }
  }
};

function mapTaskUsers<
  T extends {
    users?: Array<{
      user: unknown;
      estimatedStartDate: Date;
      estimatedEndDate: Date;
    }>;
  }
>(task: T) {
  return {
    ...task,
    users:
      task.users?.map((taskUser) => ({
        ...taskUser,
        estimatedStartDate:
          taskUser.estimatedStartDate
            .toISOString()
            .slice(0, 10),
        estimatedEndDate:
          taskUser.estimatedEndDate
            .toISOString()
            .slice(0, 10)
      })) ?? []
  };
}

function mapProjectUsers<
  T extends {
    users?: Array<{
      user: unknown;
    }>;
    tasks?: Array<{
      users?: Array<{
        user: unknown;
        estimatedStartDate: Date;
        estimatedEndDate: Date;
      }>;
    }>;
  }
>(project: T | null) {
  if (!project) {
    return project;
  }

  return {
    ...project,
    tasks:
      project.tasks?.map(mapTaskUsers) ??
      [],
    users:
      project.users?.map(
        (projectUser) => projectUser.user
      ) ?? []
  };
}

async function ensureTaskUsersBelongToProject(
  projectId: number,
  users: Array<{
    userId: string;
    estimatedStartDate?: string;
    estimatedEndDate?: string;
  }>
) {
  if (users.length === 0) {
    throw new GraphQLError(
      "At least one task user is required.",
      {
        extensions: {
          code: "BAD_USER_INPUT"
        }
      }
    );
  }

  const userIds = users.map((user) =>
    Number(user.userId)
  );
  const uniqueUserIds = new Set(userIds);

  if (uniqueUserIds.size !== userIds.length) {
    throw new GraphQLError(
      "Task users cannot contain duplicates.",
      {
        extensions: {
          code: "BAD_USER_INPUT"
        }
      }
    );
  }

  const hasInvalidDates = users.some(
    (user) =>
      user.estimatedStartDate &&
      user.estimatedEndDate &&
      new Date(user.estimatedStartDate) >
        new Date(user.estimatedEndDate)
  );

  if (hasInvalidDates) {
    throw new GraphQLError(
      "Estimated end date must be after estimated start date.",
      {
        extensions: {
          code: "BAD_USER_INPUT"
        }
      }
    );
  }

  const projectUsers =
    await prisma.projectUser.findMany({
      where: {
        projectId,
        userId: {
          in: Array.from(uniqueUserIds)
        }
      }
    });

  if (projectUsers.length !== uniqueUserIds.size) {
    throw new GraphQLError(
      "Task users must already belong to the project.",
      {
        extensions: {
          code: "BAD_USER_INPUT"
        }
      }
    );
  }
}

export const projectResolver = {
  Query: {
    projects: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireAuth(context);
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
      },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const project =
        await prisma.project.findUnique({
        where: {
          id: Number(args.id)
        },
        include: projectInclude
      });

      return mapProjectUsers(project);
    },
    timelineProjects: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const currentUser = requireAuth(context);

      if (
        currentUser.role !== "ADMIN" &&
        currentUser.role !== "PROJECT_MANAGER"
      ) {
        throw new GraphQLError(
          "Timeline access required.",
          {
            extensions: {
              code: "FORBIDDEN"
            }
          }
        );
      }

      const projects =
        await prisma.project.findMany({
          where:
            currentUser.role === "ADMIN"
              ? undefined
              : {
                  users: {
                    some: {
                      userId: currentUser.id
                    }
                  }
                },
          include: projectInclude,
          orderBy: {
            name: "asc"
          }
        });

      return projects.map(mapProjectUsers);
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
      const currentUser =
        requireProjectManager(context);

      const project =
        await prisma.project.create({
        data: {
          ...args.input,
          users: {
            create: {
              userId: currentUser.id
            }
          }
        },
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
          users: Array<{
            userId: string;
            status: string;
            estimatedStartDate: string;
            estimatedEndDate: string;
          }>;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);
      const projectId = Number(
        args.input.projectId
      );

      await ensureTaskUsersBelongToProject(
        projectId,
        args.input.users
      );

      const task = await prisma.task.create({
        data: {
          title: args.input.title,
          description:
            args.input.description,
          status: args.input.status,
          projectId,
          users: {
            create: args.input.users.map(
              (user) => ({
                userId: Number(user.userId),
                status: user.status,
                estimatedStartDate:
                  new Date(
                    user.estimatedStartDate
                  ),
                estimatedEndDate:
                  new Date(
                    user.estimatedEndDate
                  )
              })
            )
          }
        },
        include: taskInclude
      });

      return mapTaskUsers(task);
    },
    updateTask: async (
      _: unknown,
      args: {
        id: string;
        input: {
          title?: string;
          description?: string;
          status?: string;
          users?: Array<{
            userId: string;
            status: string;
            estimatedStartDate: string;
            estimatedEndDate: string;
          }>;
        };
      },
      context: GraphQLContext
    ) => {
      requireProjectManager(context);

      const existingTask =
        await prisma.task.findUnique({
          where: {
            id: Number(args.id)
          }
        });

      if (!existingTask) {
        throw new GraphQLError(
          "Task not found.",
          {
            extensions: {
              code: "NOT_FOUND"
            }
          }
        );
      }

      if (args.input.users) {
        await ensureTaskUsersBelongToProject(
          existingTask.projectId,
          args.input.users
        );
      }

      await prisma.task.update({
        where: {
          id: Number(args.id)
        },
        data: {
          ...(args.input.title !== undefined
            ? {
                title:
                  args.input.title.trim()
              }
            : {}),
          ...(args.input.description !== undefined
            ? {
                description:
                  args.input.description
              }
            : {}),
          ...(args.input.status
            ? { status: args.input.status }
            : {})
        }
      });

      if (args.input.users) {
        await prisma.taskUser.deleteMany({
          where: {
            taskId: Number(args.id)
          }
        });

        await prisma.taskUser.createMany({
          data: args.input.users.map(
            (user) => ({
              taskId: Number(args.id),
              userId: Number(user.userId),
              status: user.status,
              estimatedStartDate:
                new Date(
                  user.estimatedStartDate
                ),
              estimatedEndDate:
                new Date(
                  user.estimatedEndDate
                )
            })
          )
        });
      }

      const task =
        await prisma.task.findUniqueOrThrow({
          where: {
            id: Number(args.id)
          },
          include: taskInclude
        });

      return mapTaskUsers(task);
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

      await prisma.taskUser.deleteMany({
        where: {
          userId: Number(args.input.userId),
          task: {
            projectId: Number(
              args.input.projectId
            )
          }
        }
      });

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
