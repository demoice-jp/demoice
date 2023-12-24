/*
  Warnings:

  - Added the required column `created_date` to the `policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_date` to the `policies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "vote" AS ENUM ('positive', 'negative');

-- AlterTable
ALTER TABLE "policies" ADD COLUMN     "created_date" TIMESTAMPTZ(0) NOT NULL,
ADD COLUMN     "updated_date" TIMESTAMPTZ(0) NOT NULL,
ADD COLUMN     "vote_negative" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vote_positive" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "policy_votes" (
    "voter_id" CHAR(21) NOT NULL,
    "policy_id" CHAR(21) NOT NULL,
    "vote" "vote" NOT NULL,

    CONSTRAINT "policy_votes_pkey" PRIMARY KEY ("voter_id","policy_id")
);

-- CreateIndex
CREATE INDEX "policy_votes_policy_id_idx" ON "policy_votes"("policy_id");

-- AddForeignKey
ALTER TABLE "policy_votes" ADD CONSTRAINT "policy_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_votes" ADD CONSTRAINT "policy_votes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
