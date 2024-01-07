import React, { useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import { MyPolicyResponse } from "@/app/api/account/mypolicy/route";
import { VoteCountBar } from "@/components/component/policy-vote";
import { useInfiniteLoad } from "@/components/hooks";
import { toRelativeDate } from "@/lib/util/date";
import { swrFetcher } from "@/lib/util/util";

function UserPolicyCount() {
  const { data, isLoading, error } = useSWR<{
    count: number;
  }>(`/api/account/mypolicy/count`, swrFetcher, {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    revalidateOnMount: true,
  });

  let inner = null;
  if (isLoading) {
    inner = <div className="skeleton rounded h-[1.5rem] w-32" />;
  } else if (error) {
    inner = <div className="text-red-500 dark:text-red-600">政策投稿履歴件数を取得できませんでした</div>;
  } else if (data) {
    inner = (
      <>
        <span>政策投稿履歴{data.count}件</span>
      </>
    );
  }

  return <div className="px-3 py-1 flex items-center gap-1">{inner}</div>;
}

function UserPolicy({ policy }: { policy: MyPolicyResponse["values"][number] }) {
  const dateString = toRelativeDate(policy.commitDate);

  const latestPolicy = policy.policyVersion.policy;

  return (
    <div className="p-3 flex flex-col min-h-[5.5rem] border-t border-gray-100 dark:border-gray-900">
      <Link className="text-lg font-bold" href={`/policy/${latestPolicy.id}/${encodeURI(policy.title)}`}>
        {policy.title}
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <div className="light-text">{dateString}</div>
        </div>
        <div className="flex flex-col pt-2 h-[3rem] w-44">
          <VoteCountBar voteCount={latestPolicy} />
          <div className="flex justify-between text-xs">
            <span className="text-orange-500">賛成 {latestPolicy.votePositive.toLocaleString()}</span>
            <span className="text-blue-500">{latestPolicy.voteNegative.toLocaleString()} 反対</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPolicies() {
  const getUrl = useCallback((pageIndex: number, previousPageData: MyPolicyResponse | null) => {
    if (previousPageData && previousPageData.isLast) {
      return null;
    }
    return `/api/account/mypolicy/?page=${pageIndex}`;
  }, []);

  const { data, isLoading, error, readMore } = useInfiniteLoad(getUrl);
  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const canReadMore = !(lastData && lastData.isLast);
  const empty = data.length > 0 && data[0].values.length === 0;

  return (
    <div>
      {empty && <div className="flex justify-center w-full py-6">政策投稿履歴がありません</div>}
      {data &&
        data
          .map((d) => d.values)
          .flat()
          .map((d) => <UserPolicy key={d.id} policy={d} />)}
      {!!error && (
        <div className="flex justify-center w-full py-6 text-red-500 dark:text-red-600">
          政策投稿履歴の読み込みに失敗しました
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

export default function UserPolicyActivity() {
  return (
    <div>
      <UserPolicyCount />
      <UserPolicies />
    </div>
  );
}
