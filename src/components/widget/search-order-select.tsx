"use client";

import { ChangeEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchPolicyProp } from "@/lib/data/policy";

type SearchOrderSelectProp = {
  currentOrder: SearchPolicyProp["sort"];
};

const OPTIONS: { sort: SearchPolicyProp["sort"]; name: string }[] = [
  {
    sort: "trend",
    name: "トレンド順",
  },
  {
    sort: "votes",
    name: "投票数の多い順",
  },
  {
    sort: "created",
    name: "新しい投稿順",
  },
  {
    sort: "score",
    name: "関連度順",
  },
];

export default function SearchOrderSelect({ currentOrder }: SearchOrderSelectProp) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || "";
  const router = useRouter();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams({
        query: queryParam,
        order: e.target.value,
      });
      router.push(`/policy/search?${params.toString()}`);
    },
    [router, queryParam],
  );

  return (
    <select className="select select-sm" defaultValue={currentOrder} onChange={onChange}>
      {OPTIONS.map((o) => {
        if (!queryParam && o.sort === "score") {
          return null;
        }

        return (
          <option key={o.sort} value={o.sort}>
            {o.name}
          </option>
        );
      })}
    </select>
  );
}
