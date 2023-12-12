"use client";

import React, { useCallback, useState } from "react";
import { Content } from "@prisma/client";
import Link from "next/link";
import { useFormState } from "react-dom";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import { fillPolicyDraftTitle } from "@/lib/action/policy-draft-action";

type CreatePolicyStep1Prop = {
  draft: Content;
};

export default function CreatePolicyStep1({ draft }: CreatePolicyStep1Prop) {
  const [title, setTitle] = useState(draft.title || "");

  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setTitle(e.currentTarget.value);
  }, []);

  const [fillState, dispatch] = useFormState(fillPolicyDraftTitle, {});

  return (
    <form className="flex flex-col gap-1.5 w-screen px-6 md:w-[36rem]" action={dispatch}>
      <input type="hidden" name="id" value={draft.id} />
      <p className="text-xl">
        <label htmlFor="policy-title">政策のタイトルを記載してください。</label>
      </p>
      <input
        id="policy-title"
        name="title"
        className="single-line-input w-full"
        value={title}
        onChange={onTitleChange}
        required
        minLength={5}
        maxLength={60}
      />
      <div className="flex justify-between">
        <div>
          <FormError id="prefecture-error" messages={fillState.errors?.title} />
        </div>
        <span className="text-sm">{title.length}/60</span>
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
