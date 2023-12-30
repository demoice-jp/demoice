import React from "react";
import PolicyComments from "@/components/component/policy-comments";
import PolicyVote from "@/components/component/policy-vote";
import BackButton from "@/components/widget/back-button";
import ContentImage from "@/components/widget/content-image";
import Toast from "@/components/widget/toast";
import { auth } from "@/lib/auth/auth";
import { getMyVote, getPolicyById } from "@/lib/data/policy";
import { getUser } from "@/lib/data/user";

type PageProp = {
  params: {
    policyId: string;
  };
};

export default async function Page({ params: { policyId } }: PageProp) {
  const session = await auth();
  const accountId = session?.user?.accountId;

  const [policy, myVote, user] = await Promise.all([
    getPolicyById(policyId),
    getMyVote(policyId, accountId),
    getUser(accountId),
  ]);

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
          <div className="flex flex-col m-2 w-full md:w-[40rem] lg:mr-[calc(20rem_+_1rem)]">
            <article className="p-4 lg:p-6 rounded w-full bg-white dark:bg-black">
              <h1>{policy.content.title}</h1>
              {policy.content.image && <ContentImage className="w-full mb-4" contentImage={policy.content.image} />}
              <div className="mb-4 lg:hidden">
                <PolicyVote policy={policy} accountId={accountId} myVote={(myVote && myVote.vote) || null} />
              </div>
              <section dangerouslySetInnerHTML={{ __html: policy.content.contentHtml! }} />
            </article>
            <div className="mt-6 rounded w-full bg-white dark:bg-black">
              <PolicyComments id={policyId} user={user || undefined} />
            </div>
          </div>
          <div className="fixed top-[6.5rem] w-[20rem] right-[1rem] bg-white dark:bg-black rounded p-4 hidden lg:block">
            <PolicyVote policy={policy} accountId={accountId} myVote={(myVote && myVote.vote) || null} />
          </div>
        </main>
      )}
      <Toast />
    </div>
  );
}
