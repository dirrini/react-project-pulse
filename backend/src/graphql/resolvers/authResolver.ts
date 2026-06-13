import { GraphQLError } from "graphql";

import {
  createAuthToken,
  hashPassword,
  verifyPassword
} from "../../lib/auth";
import {
  requireAdmin,
  type GraphQLContext
} from "../context";
import { prisma } from "../../lib/prisma";

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
      requireAdmin(context);

      return prisma.user.findMany({
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
      requireAdmin(context);

      const email =
        args.input.email
          .trim()
          .toLowerCase();
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
          role: args.input.role
        }
      });
    }
  }
};
