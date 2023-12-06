"use client";

import { useFormState } from "react-dom";
import WritingDrafts from "@/components/component/writing-drafts";
import FormError from "@/components/widget/form-error";
import { startPolicyDraft } from "@/lib/action/policy-draft-action";
import { PolicyDraftSummary } from "@/lib/data/policy-draft";

type CreatePolicyProp = {
  writingDrafts: PolicyDraftSummary[];
};

export default function CreatePolicy({ writingDrafts }: CreatePolicyProp) {
  const [startPolicyState, startPolicyDispatch] = useFormState(startPolicyDraft, {});

  return (
    <div className="flex-col-center px-3 pb-9 md:w-[36rem]">
      <h3>あなたの想いを政策にして実現しましょう。</h3>
      <form action={startPolicyDispatch} className="flex-col-center">
        <button className="btn btn-primary my-4">新しく記載する</button>
        <FormError messages={startPolicyState.error} />
      </form>
      <p className="self-start">続きから記載する</p>
      <WritingDrafts writingDrafts={writingDrafts} />
    </div>
  );
}
