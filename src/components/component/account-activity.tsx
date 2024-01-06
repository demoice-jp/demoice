"use client";

import { useState } from "react";
import clsx from "clsx";
import UserCommentActivity from "@/components/component/user-comment-activity";
import UserVoteActivity from "@/components/component/user-vote-activity";

export default function AccountActivity() {
  const [tab, setTab] = useState<"votes" | "comments" | "policies">("votes");

  return (
    <div>
      <div role="tablist" className="tabs tabs-bordered">
        <a
          role="tab"
          className={clsx("tab", tab === "votes" && "tab-active")}
          onClick={() => {
            setTab("votes");
          }}
        >
          投票
        </a>
        <a
          role="tab"
          className={clsx("tab", tab === "comments" && "tab-active")}
          onClick={() => {
            setTab("comments");
          }}
        >
          コメント
        </a>
        <a
          role="tab"
          className={clsx("tab", tab === "policies" && "tab-active")}
          onClick={() => {
            setTab("policies");
          }}
        >
          政策投稿
        </a>
      </div>
      <div className={clsx(tab !== "votes" && "hidden")}>
        <UserVoteActivity />
      </div>
      <div className={clsx(tab !== "comments" && "hidden")}>
        <UserCommentActivity />
      </div>
      <div className={clsx(tab !== "policies" && "hidden")}>政策投稿はありません</div>
    </div>
  );
}
