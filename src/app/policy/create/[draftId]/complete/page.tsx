import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { getPolicyByContentId } from "@/lib/data/policy";

type PageProp = {
  params: {
    draftId: string;
  };
};

export default async function Page({ params: { draftId } }: PageProp) {
  const policy = await getPolicyByContentId(draftId);
  if (!policy) {
    redirect("/policy/create");
  }

  return (
    <>
      <Breadcrumbs interPages={[{ name: "新規投稿", url: "/policy/create" }]} currentPage="投稿完了" />
      <main className="flex-col-center">
        <section className="flex-col-center justify-center">
          <p className="text-xl">あなたの政策提案を投稿できました&#x1F389;</p>
          <p className="text-xl">ありがとうございました！</p>
          <Link href={`/policy/${policy.id}/${encodeURI(policy.content.title!)}`} className="btn btn-primary">
            投稿した政策を見る
          </Link>
        </section>
      </main>
    </>
  );
}
