-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "externalCode" TEXT,
    "status" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "materialCode" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "materialDescription" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
