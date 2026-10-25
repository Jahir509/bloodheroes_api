/*
  Warnings:

  - Added the required column `name_bn` to the `districts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_bn` to the `upazilas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contact_reveals" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "districts" ADD COLUMN     "name_bn" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "donors" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "otp_codes" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "upazilas" ADD COLUMN     "name_bn" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);
