import React from "react";
import PolicyVote from "@/components/component/policy-vote";
import BackButton from "@/components/widget/back-button";
import ContentImage from "@/components/widget/content-image";
import Toast from "@/components/widget/toast";
import { auth } from "@/lib/auth/auth";
import { getMyVote, getPolicyById } from "@/lib/data/policy";

type PageProp = {
  params: {
    policyId: string;
  };
};

export default async function Page({ params: { policyId } }: PageProp) {
  const session = await auth();
  const accountId = session?.user?.accountId;

  const [policy, myVote] = await Promise.all([getPolicyById(policyId), getMyVote(policyId, accountId)]);

  return (
    <div className="w-full p-4">
      <BackButton />
      {!policy && (
        <div className="flex w-full justify-center">
          <p className="text-lg">政策が見つかりません</p>
        </div>
      )}
      {policy && (
        <main className="flex-col-center w-full">
          <article className="flex flex-col m-2 p-2 rounded w-full md:w-[40rem] bg-white dark:bg-black lg:mr-[calc(20rem_+_1rem)]">
            <h1>{policy.content.title}</h1>
            {policy.content.image && <ContentImage className="w-full mb-4" contentImage={policy.content.image} />}
            <div className="mb-4 lg:hidden">
              <PolicyVote policy={policy} accountId={accountId} myVote={(myVote && myVote.vote) || null} />
            </div>
            <section dangerouslySetInnerHTML={{ __html: policy.content.contentHtml! }} />
          </article>
          <div className="fixed top-[6.5rem] w-[20rem] right-[1rem] bg-white dark:bg-black rounded p-4 hidden lg:block">
            <PolicyVote policy={policy} accountId={accountId} myVote={(myVote && myVote.vote) || null} />
          </div>
        </main>
      )}
      <Toast />
    </div>
  );
}
