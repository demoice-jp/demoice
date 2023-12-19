-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "provider" AS ENUM ('line');

-- CreateTable
CREATE TABLE "users" (
    "id" CHAR(21) NOT NULL,
    "user_name" VARCHAR(36) NOT NULL,
    "gender" "gender" NOT NULL,
    "birth_date" DATE NOT NULL,
    "prefecture" CHAR(2) NOT NULL,
    "created_date" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_ids" (
    "provider" "provider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" CHAR(21) NOT NULL,

    CONSTRAINT "provider_ids_pkey" PRIMARY KEY ("provider","provider_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE INDEX "provider_ids_user_id_idx" ON "provider_ids"("user_id");

-- AddForeignKey
ALTER TABLE "provider_ids" ADD CONSTRAINT "provider_ids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
