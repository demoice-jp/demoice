"use client";

import React from "react";
import { Content } from "@prisma/client";
import Link from "next/link";
import SubmitButton from "@/components/widget/submit-button";

type CreatePolicyImageProp = {
  draft: Content;
};

export default function CreatePolicyImage({ draft }: CreatePolicyImageProp) {
  return (
    <form>
      <p className="text-xl">見出しとなる画像を添付してください。</p>
      <p>画像は省略可能ですが、注目を集めるために添付することをおすすめします。</p>
      <div className="flex justify-between">
        <Link href={`/policy/create/${draft.id}/content`} className="btn">
          戻る
        </Link>
        <SubmitButton type="submit" className="btn btn-primary">
          次へ
        </SubmitButton>
      </div>
    </form>
  );
}
