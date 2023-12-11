import React from "react";
import { redirect } from "next/navigation";
import PolicyCreateSteps from "@/components/component/policy-create-steps";
import CreatePolicyStep1 from "@/components/page/create-policy-step1";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { getContent } from "@/lib/data/content";

type PageProp = {
  params: {
    draftId: string;
  };
};

export default async function Page({ params: { draftId } }: PageProp) {
  const draft = await getContent(draftId);
  if (!draft) {
    redirect("/policy/create");
  }

  return (
    <>
      <Breadcrumbs interPages={[{ name: "新規投稿", url: "/policy/create" }]} currentPage="概要記載" />
      <main className="flex-col-center">
        <section className="flex-col-center justify-center">
          <PolicyCreateSteps currentStep={1} />
          <CreatePolicyStep1 draft={draft} />
        </section>
      </main>
    </>
  );
}
