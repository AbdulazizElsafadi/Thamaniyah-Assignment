-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "public"."TargetType" AS ENUM ('program', 'user');

-- CreateEnum
CREATE TYPE "public"."ProgramStatus" AS ENUM ('public', 'draft', 'archived');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users_roles" (
    "userId" INTEGER NOT NULL,
    "role" "public"."UserRole" NOT NULL,

    CONSTRAINT "users_roles_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "public"."users_sessions" (
    "id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" INTEGER,
    "action" TEXT NOT NULL,
    "target_type" "public"."TargetType" NOT NULL,
    "target_id" TEXT,
    "meta" JSONB,
    "ip" INET,
    "ua" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "public"."ProgramStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_id" INTEGER,
    "publication_date" TIMESTAMP(3),
    "language" TEXT,
    "duration_seconds" INTEGER,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."program_published" (
    "program_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_slug" TEXT,
    "language" TEXT,
    "duration_seconds" INTEGER,

    CONSTRAINT "program_published_pkey" PRIMARY KEY ("program_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "public"."category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "public"."category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "program_slug_key" ON "public"."program"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "program_published_slug_key" ON "public"."program_published"("slug");

-- AddForeignKey
ALTER TABLE "public"."users_roles" ADD CONSTRAINT "users_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_sessions" ADD CONSTRAINT "users_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program" ADD CONSTRAINT "program_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."program_published" ADD CONSTRAINT "program_published_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
