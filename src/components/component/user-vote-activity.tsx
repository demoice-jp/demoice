import React, { useCallback } from "react";
import clsx from "clsx";
import Link from "next/link";
import useSWR from "swr";
import { MyVoteResponse } from "@/app/api/account/myvote/route";
import { VoteCountBar } from "@/components/component/policy-vote";
import { useInfiniteLoad } from "@/components/hooks";
import { toRelativeDate } from "@/lib/util/date";
import { swrFetcher } from "@/lib/util/util";

function UserVoteCount() {
  const { data, isLoading, error } = useSWR<{
    count: number;
  }>(`/api/account/myvote/count`, swrFetcher, {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  let inner = null;
  if (isLoading) {
    inner = <div className="skeleton rounded h-[1.5rem] w-32" />;
  } else if (error) {
    inner = <div className="text-red-500 dark:text-red-600">投票履歴件数を取得できませんでした</div>;
  } else if (data) {
    inner = (
      <>
        <span>投票履歴{data.count}件</span>
      </>
    );
  }

  return <div className="px-3 py-1 flex items-center gap-1">{inner}</div>;
}

function UserVote({ vote }: { vote: MyVoteResponse["values"][number] }) {
  const dateString = toRelativeDate(vote.votedDate);

  const policy = vote.policy;
  return (
    <div className="p-3 flex flex-col min-h-[5.5rem] border-t border-gray-100 dark:border-gray-900">
      <Link className="text-lg font-bold" href={`/policy/${policy.id}/${encodeURI(policy.content.title)}`}>
        {policy.content.title}
      </Link>
      <div className="flex justify-between">
        <div className="flex mt-2 items-center gap-4">
          <div
            className={clsx(
              "text-center w-16 rounded-3xl px-1 text-white",
              vote.vote === "positive" ? "bg-orange-500" : "bg-blue-500",
            )}
          >
            {vote.vote === "positive" ? "賛成" : "反対"}
          </div>
          <div className="light-text">{dateString}</div>
        </div>
        <div className="flex flex-col pt-2 h-[3rem] w-44">
          <VoteCountBar voteCount={policy} />
          <div className="flex justify-between text-xs">
            <span className="text-orange-500">賛成 {policy.votePositive.toLocaleString()}</span>
            <span className="text-blue-500">{policy.voteNegative.toLocaleString()} 反対</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserVotes() {
  const getUrl = useCallback((pageIndex: number, previousPageData: MyVoteResponse | null) => {
    if (previousPageData && previousPageData.isLast) {
      return null;
    }
    return `/api/account/myvote/?page=${pageIndex}`;
  }, []);

  const { data, isLoading, error, readMore } = useInfiniteLoad(getUrl);
  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const canReadMore = !(lastData && lastData.isLast);
  const empty = data.length > 0 && data[0].values.length === 0;

  return (
    <div>
      {empty && <div className="flex justify-center w-full py-6">投票履歴がありません</div>}
      {data &&
        data
          .map((d) => d.values)
          .flat()
          .map((d) => <UserVote key={d.policy.id} vote={d} />)}
      {!!error && (
        <div className="flex justify-center w-full py-6 text-red-500 dark:text-red-600">
          投票履歴の読み込みに失敗しました
        </div>
      )}
      {isLoading ? (
        <div className="w-full">
          <div className="p-3 h-[5.5rem]">
            <div className="skeleton rounded w-full h-full" />
          </div>
          <div className="p-3 h-[5.5rem]">
            <div className="skeleton rounded w-full h-full" />
          </div>
          <div className="p-3 h-[5.5rem]">
            <div className="skeleton rounded w-full h-full" />
          </div>
        </div>
      ) : (
        (canReadMore || !!error) && (
          <div className="flex p-4 justify-center w-full">
            {!!error ? (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  readMore();
                }}
              >
                再読み込み
              </button>
            ) : (
              canReadMore && (
                <button className="btn btn-sm btn-primary" onClick={() => readMore()}>
                  さらに表示
                </button>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function UserVoteActivity() {
  return (
    <div>
      <UserVoteCount />
      <UserVotes />
    </div>
  );
}
