-- AlterTable
ALTER TABLE "Product" ADD COLUMN "domain" TEXT;
ALTER TABLE "Product" ALTER COLUMN "category" SET DEFAULT 'WEB';

-- CreateIndex
CREATE UNIQUE INDEX "Product_domain_key" ON "Product"("domain");
