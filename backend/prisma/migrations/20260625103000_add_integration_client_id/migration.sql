ALTER TABLE "IntegrationClient" ADD COLUMN "clientId" TEXT;

CREATE UNIQUE INDEX "IntegrationClient_clientId_key" ON "IntegrationClient"("clientId");
