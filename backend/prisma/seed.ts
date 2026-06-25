import { PrismaClient } from "@prisma/client";

import { hashPassword }
  from "../src/lib/auth";
import { hashApiKey }
  from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ??
    "admin@projectpulse.local";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ??
    "admin123";

  await prisma.user.upsert({
    where: {
      email: adminEmail
    },
    update: {
      name: "ProjectPulse Admin",
      role: "ADMIN"
    },
    create: {
      name: "ProjectPulse Admin",
      email: adminEmail,
      passwordHash:
        hashPassword(adminPassword),
      role: "ADMIN"
    }
  });

  const projectCount =
    await prisma.project.count();

  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          name: "CRM Migration",
          description:
            "Migrating legacy CRM system",
          progress: 72,
          status: "ON_TRACK"
        },
        {
          name:
            "Mobile App Redesign",
          description:
            "Modernizing the mobile UX",
          progress: 45,
          status: "AT_RISK"
        },
        {
          name:
            "OCI Cloud Migration",
          description:
            "Moving workloads to Oracle Cloud",
          progress: 90,
          status: "COMPLETED"
        }
      ]
    });
  }

  const integrationClientSecret =
    process.env.SEED_INTEGRATION_CLIENT_SECRET ??
    process.env.SEED_INTEGRATION_API_KEY;

  if (integrationClientSecret) {
    const integrationClientId =
      process.env.SEED_INTEGRATION_CLIENT_ID ??
      "sap-purchase-orders";
    const integrationName =
      process.env.SEED_INTEGRATION_NAME ??
      "SAP Purchase Orders";
    const integrationScopes =
      process.env.SEED_INTEGRATION_SCOPES ??
      "products:write";

    const existingIntegrationClient =
      await prisma.integrationClient.findFirst({
        where: {
          OR: [
            {
              clientId:
                integrationClientId
            },
            {
              keyHash: hashApiKey(
                integrationClientSecret
              )
            }
          ]
        }
      });

    const integrationClient =
      existingIntegrationClient
        ? await prisma.integrationClient.update({
            where: {
              id: existingIntegrationClient.id
            },
            data: {
              clientId: integrationClientId,
              keyHash: hashApiKey(
                integrationClientSecret
              ),
              name: integrationName,
              scopes: integrationScopes,
              isActive: true
            }
          })
        : await prisma.integrationClient.create({
            data: {
              clientId: integrationClientId,
              name: integrationName,
              keyHash: hashApiKey(
                integrationClientSecret
              ),
              scopes: integrationScopes
            }
          });

    const projectExternalCode =
      process.env
        .SEED_INTEGRATION_PROJECT_EXTERNAL_CODE;

    if (projectExternalCode) {
      const project =
        await prisma.project.findUnique({
          where: {
            externalCode: projectExternalCode
          }
        });

      if (project) {
        await prisma.integrationClientProject.upsert({
          where: {
            integrationClientId_projectId: {
              integrationClientId:
                integrationClient.id,
              projectId: project.id
            }
          },
          update: {},
          create: {
            integrationClientId:
              integrationClient.id,
            projectId: project.id
          }
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
