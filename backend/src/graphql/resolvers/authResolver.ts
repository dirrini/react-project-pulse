import { GraphQLError } from "graphql";

import {
  createAuthToken,
  verifyPassword
} from "../../lib/auth";
import type { GraphQLContext }
  from "../context";
import { prisma } from "../../lib/prisma";

export const authResolver = {
  Query: {
    me: (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => context.currentUser
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
    }
  }
};
