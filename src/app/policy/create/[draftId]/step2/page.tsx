import React from "react";
import { redirect } from "next/navigation";
import PolicyCreateSteps from "@/components/component/policy-create-steps";
import CreatePolicyStep2 from "@/components/page/create-policy-step2";
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
      <Breadcrumbs interPages={[{ name: "新規投稿", url: "/policy/create" }]} currentPage="本文記載" />
      <main className="flex-col-center">
        <section className="flex-col-center justify-center">
          <PolicyCreateSteps currentStep={2} />
          <CreatePolicyStep2 draft={draft} />
        </section>
      </main>
    </>
  );
}
