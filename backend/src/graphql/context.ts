import type { Request } from "express";
import type { User } from "@prisma/client";
import { GraphQLError } from "graphql";

import { verifyAuthToken }
  from "../lib/auth";
import { prisma } from "../lib/prisma";

export type GraphQLContext = {
  currentUser: User | null;
};

export function requireAuth(
  context: GraphQLContext
) {
  if (!context.currentUser) {
    throw new GraphQLError(
      "Authentication required.",
      {
        extensions: {
          code: "UNAUTHENTICATED"
        }
      }
    );
  }

  return context.currentUser;
}

function getTokenFromRequest(req: Request) {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [
    type,
    token
  ] = authorization.split(" ");

  if (
    type !== "Bearer" ||
    !token
  ) {
    return null;
  }

  return token;
}

export async function createGraphQLContext(
  req: Request
): Promise<GraphQLContext> {
  const token = getTokenFromRequest(req);

  if (!token) {
    return {
      currentUser: null
    };
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return {
      currentUser: null
    };
  }

  const currentUser =
    await prisma.user.findUnique({
      where: {
        id: payload.userId
      }
    });

  return {
    currentUser
  };
}
