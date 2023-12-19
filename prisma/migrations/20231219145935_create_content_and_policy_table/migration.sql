-- CreateTable
CREATE TABLE "contents" (
    "id" CHAR(21) NOT NULL,
    "author_id" CHAR(21) NOT NULL,
    "title" VARCHAR(60),
    "content" TEXT,
    "content_html" TEXT,
    "content_string" TEXT,
    "image" JSONB,
    "created_date" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commit_date" TIMESTAMPTZ(0),

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" CHAR(21) NOT NULL,
    "content_id" CHAR(21) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_versions" (
    "policy_id" CHAR(21) NOT NULL,
    "version" INTEGER NOT NULL,
    "content_id" CHAR(21) NOT NULL,

    CONSTRAINT "policy_versions_pkey" PRIMARY KEY ("policy_id","version")
);

-- CreateIndex
CREATE INDEX "contents_author_id_idx" ON "contents"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "policies_content_id_key" ON "policies"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "policy_versions_content_id_key" ON "policy_versions"("content_id");

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_versions" ADD CONSTRAINT "policy_versions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
