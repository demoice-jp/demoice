import CreatePolicyStep0 from "@/components/page/create-policy-step0";
import { getPolicyDraftSummary } from "@/lib/data/policy-draft";

export default async function Page() {
  const drafts = await getPolicyDraftSummary();

  return (
    <>
      <CreatePolicyStep0 writingDrafts={drafts} />
    </>
  );
}
