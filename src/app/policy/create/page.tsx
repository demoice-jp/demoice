import React from "react";
import CreatePolicy from "@/components/page/create-policy";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { getContentSummaries } from "@/lib/data/content";

export default async function Page() {
  const drafts = await getContentSummaries();

  return (
    <>
      <Breadcrumbs currentPage="新規投稿" />
      <main className="flex-col-center">
        <section className="flex-col-center justify-center">
          <CreatePolicy writingDrafts={drafts} />
        </section>
      </main>
    </>
  );
}
