"use client";

import React from "react";
import { Policy } from ".prisma/client";
import { Content } from "@prisma/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { VoteSuccess } from "@/app/api/policy/[id]/vote/route";
import { swrFetcher } from "@/lib/util/util";

type PolicyVoteProp = {
  accountId?: string;
  policy: Policy & { content: Content };
};

export default function PolicyVote({ policy, accountId }: PolicyVoteProp) {
  const router = useRouter();

  const swrKey = `/api/policy/${policy.id}/vote`;
  const {
    data: latestVote,
    isLoading,
    error,
  } = useSWR<VoteSuccess>(swrKey, swrFetcher, {
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { trigger, isMutating } = useSWRMutation(
    swrKey,
    async (url, { arg }: { arg: "positive" | "negative" | null }) => {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote: arg,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw res;
          }
          return res.json();
        })
        .then((d: VoteSuccess) => ({
          votePositive: d.votePositive,
          voteNegative: d.voteNegative,
          myVote: d.myVote,
        }));
    },
    {
      populateCache: (result) => result,
      revalidate: false,
      onError: async () => {
        toast.error("投票に失敗しました");
      },
    },
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-[6rem]">
        <div className="skeleton flex h-6 mb-1" />
        <div className="flex justify-between">
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-8 w-24" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-[6rem] flex items-center justify-center text-sm text-red-500 dark:text-red-600">
        投票データの取得に失敗しました。
      </div>
    );
  }

  const voteCount = latestVote!;

  const onVote = async (vote: "positive" | "negative") => {
    if (!accountId) {
      router.push(
        `/auth/signin?${new URLSearchParams({
          callback: `/policy/${policy.id}/${encodeURI(policy.content.title!)}`,
        })}`,
      );
      return;
    }
    await trigger(vote === voteCount.myVote ? null : vote);
  };

  return (
    <div className="flex flex-col h-[6rem]">
      <VoteCountBar voteCount={voteCount} />
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <button
              disabled={isMutating}
              className="flex items-center btn btn-sm bg-orange-400 hover:bg-orange-500 disabled:bg-orange-400 disabled:hover:bg-orange-500 text-white"
              onClick={() => {
                onVote("positive");
              }}
            >
              <span className="material-symbols-outlined">thumb_up</span>
              <span>賛成</span>
            </button>
            <span className="mx-2 text-orange-500">{voteCount.votePositive.toLocaleString()}</span>
          </div>
          {voteCount.myVote && voteCount.myVote === "positive" && (
            <div className="w-16 text-center text-sm text-orange-500 border-2 rounded-3xl border-orange-500 px-1 ml-2">
              投票済
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="mx-2 text-blue-500">{voteCount.voteNegative.toLocaleString()}</span>
            <button
              disabled={isMutating}
              className="flex items-center btn btn-sm bg-blue-400 hover:bg-blue-500 disabled:bg-blue-400 disabled:hover:bg-blue-500 text-white"
              onClick={() => {
                onVote("negative");
              }}
            >
              <span className="material-symbols-outlined">thumb_down</span>
              <span>反対</span>
            </button>
          </div>
          {voteCount.myVote && voteCount.myVote === "negative" && (
            <div className="w-16 text-center text-sm text-blue-500 border-2 rounded-3xl border-blue-500 px-1 mr-2">
              投票済
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VoteCountBar({
  voteCount,
}: {
  voteCount: {
    votePositive: number;
    voteNegative: number;
  };
}) {
  return (
    <div className="flex h-6 mb-1">
      <div
        style={{
          flexGrow: voteCount.votePositive,
        }}
        className="h-full bg-orange-500 transition-all"
      />
      <div
        style={{
          flexGrow: voteCount.votePositive || voteCount.voteNegative ? 0 : 1,
        }}
        className="h-full bg-gray-300 transition-all"
      />
      <div
        style={{
          flexGrow: voteCount.voteNegative,
        }}
        className="h-full bg-blue-500 transition-all"
      />
    </div>
  );
}
