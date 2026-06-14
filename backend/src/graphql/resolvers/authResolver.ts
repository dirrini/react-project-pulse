import { GraphQLError } from "graphql";

import {
  createAuthToken,
  hashPassword,
  verifyPassword
} from "../../lib/auth";
import {
  requireAuth,
  requireUserManager,
  type GraphQLContext
} from "../context";
import { prisma } from "../../lib/prisma";

const manageableRoles = [
  "PROJECT_MANAGER",
  "MEMBER"
];

export const authResolver = {
  Query: {
    me: (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => context.currentUser,

    users: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireUserManager(context);

      return prisma.user.findMany({
        where: {
          role: {
            not: "ADMIN"
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }
  },

  Mutation: {
    login: async (
      _: unknown,
      args: {
        email: string;
        password: string;
      }
    ) => {
      const user =
        await prisma.user.findUnique({
          where: {
            email: args.email
          }
        });

      if (
        !user ||
        !verifyPassword(
          args.password,
          user.passwordHash
        )
      ) {
        throw new GraphQLError(
          "Invalid email or password.",
          {
            extensions: {
              code: "UNAUTHENTICATED"
            }
          }
        );
      }

      return {
        token: createAuthToken({
          userId: user.id,
          role: user.role
        }),
        user
      };
    },
    createUser: async (
      _: unknown,
      args: {
        input: {
          name: string;
          email: string;
          password: string;
          role: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireUserManager(context);

      const email =
        args.input.email
          .trim()
          .toLowerCase();
      const role = args.input.role;

      if (
        !manageableRoles.includes(role)
      ) {
        throw new GraphQLError(
          "This role cannot be assigned.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email
          }
        });

      if (existingUser) {
        throw new GraphQLError(
          "A user with this email already exists.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      return prisma.user.create({
        data: {
          name: args.input.name.trim(),
          email,
          passwordHash: hashPassword(
            args.input.password
          ),
          role
        }
      });
    },
    updateUser: async (
      _: unknown,
      args: {
        id: string;
        input: {
          name?: string;
          email?: string;
          role?: string;
        };
      },
      context: GraphQLContext
    ) => {
      requireUserManager(context);

      const user =
        await prisma.user.findUnique({
          where: {
            id: Number(args.id)
          }
        });

      if (!user || user.role === "ADMIN") {
        throw new GraphQLError(
          "User not found.",
          {
            extensions: {
              code: "NOT_FOUND"
            }
          }
        );
      }

      if (
        args.input.role &&
        !manageableRoles.includes(
          args.input.role
        )
      ) {
        throw new GraphQLError(
          "This role cannot be assigned.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      const email =
        args.input.email
          ?.trim()
          .toLowerCase();

      if (email && email !== user.email) {
        const existingUser =
          await prisma.user.findUnique({
            where: {
              email
            }
          });

        if (existingUser) {
          throw new GraphQLError(
            "A user with this email already exists.",
            {
              extensions: {
                code: "BAD_USER_INPUT"
              }
            }
          );
        }
      }

      return prisma.user.update({
        where: {
          id: Number(args.id)
        },
        data: {
          ...(args.input.name !== undefined
            ? {
                name:
                  args.input.name.trim()
              }
            : {}),
          ...(email
            ? { email }
            : {}),
          ...(args.input.role
            ? { role: args.input.role }
            : {})
        }
      });
    },
    updateMyPassword: async (
      _: unknown,
      args: {
        input: {
          currentPassword: string;
          newPassword: string;
        };
      },
      context: GraphQLContext
    ) => {
      const currentUser =
        requireAuth(context);

      if (
        !verifyPassword(
          args.input.currentPassword,
          currentUser.passwordHash
        )
      ) {
        throw new GraphQLError(
          "Current password is incorrect.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      if (
        args.input.newPassword.length < 6
      ) {
        throw new GraphQLError(
          "New password must be at least 6 characters.",
          {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          }
        );
      }

      await prisma.user.update({
        where: {
          id: currentUser.id
        },
        data: {
          passwordHash: hashPassword(
            args.input.newPassword
          )
        }
      });

      return true;
    }
  }
};
