"use client";

import { useFormState } from "react-dom";
import WritingDrafts from "@/components/component/writing-drafts";
import FormError from "@/components/widget/form-error";
import { startPolicyDraft } from "@/lib/action/policy-draft-action";
import { PolicyDraftSummary } from "@/lib/data/policy-draft";

type CreatePolicyStep0Prop = {
  writingDrafts: PolicyDraftSummary[];
};

export default function CreatePolicyStep0({ writingDrafts }: CreatePolicyStep0Prop) {
  const [startPolicyState, startPolicyDispatch] = useFormState(startPolicyDraft, {});

  return (
    <div className="flex-col-center gap-4 px-3 pb-9 md:w-[36rem]">
      <h2>あなたの想いを政策にして実現しましょう。</h2>
      <form action={startPolicyDispatch} className="flex-col-center">
        <button className="btn btn-primary">新しく記載する</button>
        <FormError messages={startPolicyState.error} />
      </form>
      <h3 className="self-start">続きから記載する</h3>
      <WritingDrafts writingDrafts={writingDrafts} />
    </div>
  );
}
