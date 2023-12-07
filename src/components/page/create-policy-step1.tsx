"use client";

import React, { useCallback, useState } from "react";
import { Content } from "@prisma/client";
import Link from "next/link";
import { useFormState } from "react-dom";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import { fillPolicyDraftSummary } from "@/lib/action/policy-draft-action";

type CreatePolicyStep1Prop = {
  draft: Content;
};

export default function CreatePolicyStep1({ draft }: CreatePolicyStep1Prop) {
  const [summary, setSummary] = useState(draft.summary || "");

  const onSummaryChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSummary(e.currentTarget.value);
  }, []);

  const [fillState, dispatch] = useFormState(fillPolicyDraftSummary, {});

  return (
    <form className="flex flex-col gap-1.5 w-screen px-6 md:w-[36rem]" action={dispatch}>
      <input type="hidden" name="id" value={draft.id} />
      <p className="text-xl">
        <label htmlFor="policy-summary">政策の概要を記載してください。</label>
      </p>
      <input
        id="policy-summary"
        name="summary"
        className="single-line-input w-full"
        value={summary}
        onChange={onSummaryChange}
        required
        minLength={5}
        maxLength={60}
      />
      <div className="flex justify-between">
        <div>
          <FormError id="prefecture-error" messages={fillState.errors?.summary} />
        </div>
        <span className="text-sm">{summary.length}/60</span>
      </div>
      <div className="flex justify-between mt-2">
        <Link href="/policy/create" className="btn">
          戻る
        </Link>
        <SubmitButton>次へ</SubmitButton>
      </div>
      <div className="flex justify-end">
        <FormError messages={fillState.message} />
      </div>
    </form>
  );
}
