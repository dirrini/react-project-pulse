import { PrismaClient } from "@prisma/client";
import {
  randomBytes,
  scryptSync
} from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(
    password,
    salt,
    64
  ).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

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
