"use client";

import React from "react";
import { Content } from "@prisma/client";
import Link from "next/link";
import { useFormState } from "react-dom";
import ContentImage from "@/components/widget/content-image";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import { commitPolicyDraft } from "@/lib/action/policy-draft-action";

type CreatePolicyConfirmProp = {
  draft: Content;
};

export default function CreatePolicyConfirm({ draft }: CreatePolicyConfirmProp) {
  const [formState, dispatch] = useFormState(commitPolicyDraft, {});

  return (
    <>
      <p>投稿内容をご確認の上、下部の投稿ボタンを押してください。</p>
      <div className="flex flex-col w-screen px-6 md:w-[44rem]">
        <h1>{draft.title}</h1>
        {draft.image && <ContentImage className="w-full" contentImage={draft.image} />}
        <div dangerouslySetInnerHTML={{ __html: draft.contentHtml! }} />
      </div>
      <form className="flex flex-col gap-1.5 my-8 w-screen px-6 md:w-[36rem]" action={dispatch}>
        <input type="hidden" name="id" value={draft.id} />
        <div className="flex justify-between">
          <Link href={`/policy/create/${draft.id}/image`} className="btn">
            戻る
          </Link>
          <SubmitButton type="submit" className="btn btn-primary">
            投稿
          </SubmitButton>
        </div>
        <div className="flex justify-end">
          <FormError messages={formState.message} />
        </div>
      </form>
    </>
  );
}
