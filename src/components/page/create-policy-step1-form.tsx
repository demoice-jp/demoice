"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";

export default function CreatePolicyStep1Form() {
  const [summary, setSummary] = useState("");

  const onSummaryChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setSummary(e.currentTarget.value);
  }, []);

  return (
    <form className="flex flex-col gap-1.5 w-screen px-3 md:w-[36rem]">
      <h2>
        <label htmlFor="policy-summary">政策の概要を記載してください。</label>
      </h2>
      <input
        id="policy-summary"
        className="input input-bordered w-full"
        value={summary}
        onChange={onSummaryChange}
        required
        minLength={5}
        maxLength={60}
      />
      <div className="flex justify-between">
        <span />
        <span className="text-sm">{summary.length}/60</span>
      </div>
      <div className="flex justify-between mt-2">
        <Link href="/policy/create/step0" className="btn">
          戻る
        </Link>
        <Link href="/policy/create/step2" className="btn btn-primary">
          次へ
        </Link>
      </div>
    </form>
  );
}
