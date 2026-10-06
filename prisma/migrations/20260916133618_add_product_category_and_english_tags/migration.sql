/*
  Warnings:

  - The values [SOB_ENCOMENDA,ACABA_RAPIDO,ESGOTADO,PROMOCAO] on the enum `ProductTag` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('DRAWING', 'PRINT', 'TENUGUI', 'SOCKS', 'ECOBAG', 'CUSTOM');

-- AlterEnum
BEGIN;
CREATE TYPE "ProductTag_new" AS ENUM ('MADE_TO_ORDER', 'LIMITED', 'SOLD_OUT', 'ON_SALE');
ALTER TABLE "Product" ALTER COLUMN "tags" TYPE "ProductTag_new"[] USING ("tags"::text::"ProductTag_new"[]);
ALTER TYPE "ProductTag" RENAME TO "ProductTag_old";
ALTER TYPE "ProductTag_new" RENAME TO "ProductTag";
DROP TYPE "public"."ProductTag_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL;
