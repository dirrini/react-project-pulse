-- AlterTable
ALTER TABLE "Project" ADD COLUMN "externalCode" TEXT;

-- CreateTable
CREATE TABLE "IntegrationClient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationClientProject" (
    "id" SERIAL NOT NULL,
    "integrationClientId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationClientProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_externalCode_key" ON "Project"("externalCode");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationClient_keyHash_key" ON "IntegrationClient"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationClientProject_integrationClientId_projectId_key" ON "IntegrationClientProject"("integrationClientId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_projectId_externalCode_key" ON "Product"("projectId", "externalCode");

-- AddForeignKey
ALTER TABLE "IntegrationClientProject" ADD CONSTRAINT "IntegrationClientProject_integrationClientId_fkey" FOREIGN KEY ("integrationClientId") REFERENCES "IntegrationClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationClientProject" ADD CONSTRAINT "IntegrationClientProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
