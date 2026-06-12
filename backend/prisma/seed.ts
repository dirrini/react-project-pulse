import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.project.deleteMany();

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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });