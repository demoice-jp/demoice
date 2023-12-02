"use client";

import React, { useCallback, useState } from "react";
import { PolicyDraft } from "@prisma/client";
import Link from "next/link";
import { useFormState } from "react-dom";
import FormError from "@/components/widget/form-error";
import { fillPolicyDraftSummary } from "@/lib/action/policy-draft-action";

type CreatePolicyStep1Prop = {
  draft: PolicyDraft;
};

export default function CreatePolicyStep1({ draft }: CreatePolicyStep1Prop) {
  const [summary, setSummary] = useState(draft.summary || "");

  const onSummaryChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSummary(e.currentTarget.value);
  }, []);

  const [fillState, dispatch] = useFormState(fillPolicyDraftSummary, {});

  return (
    <form className="flex flex-col gap-1.5 w-screen px-3 md:w-[36rem]" action={dispatch}>
      <input type="hidden" name="id" value={draft.id} />
      <h2>
        <label htmlFor="policy-summary">政策の概要を記載してください。</label>
      </h2>
      <input
        id="policy-summary"
        name="summary"
        className="input input-bordered w-full"
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
        <button type="submit" className="btn btn-primary">
          次へ
        </button>
      </div>
      <div className="flex justify-end">
        <FormError messages={fillState.message} />
      </div>
    </form>
  );
}
