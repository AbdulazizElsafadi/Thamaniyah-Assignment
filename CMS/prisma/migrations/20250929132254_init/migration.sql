-- CreateEnum
CREATE TYPE "public"."ImportStatus" AS ENUM ('success', 'failed');

-- AlterTable
ALTER TABLE "public"."program" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "external_source" TEXT;

-- CreateTable
CREATE TABLE "public"."import_log" (
    "id" BIGSERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "status" "public"."ImportStatus" NOT NULL,
    "inserted_count" INTEGER NOT NULL,
    "updated_count" INTEGER NOT NULL,
    "error_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_log_pkey" PRIMARY KEY ("id")
);
