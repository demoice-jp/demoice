import React, { useCallback } from "react";
import Link from "next/link";
import { MyCommentResponse } from "@/app/api/account/mycomment/route";
import { useInfiniteLoad } from "@/components/hooks";
import { toRelativeDate } from "@/lib/util/date";

function UserComment({ comment }: { comment: MyCommentResponse["values"][number] }) {
  const dateString = toRelativeDate(comment.postedDate);

  const policy = comment.policy;
  return (
    <div className="p-3 flex flex-col min-h-[5.5rem] not-first:border-t border-gray-100 dark:border-gray-900">
      <Link className="font-bold" href={`/policy/${policy.id}/${encodeURI(policy.content.title)}`}>
        {policy.content.title}
      </Link>
      <div className="pl-2">
        <div className="flex justify-end light-text">{dateString}</div>
        <pre className="text-sm">{comment.content}</pre>
      </div>
    </div>
  );
}

function UserComments() {
  const getUrl = useCallback((pageIndex: number, previousPageData: MyCommentResponse | null) => {
    if (previousPageData && previousPageData.isLast) {
      return null;
    }
    return `/api/account/mycomment/?page=${pageIndex}`;
  }, []);

  const { data, isLoading, error, readMore } = useInfiniteLoad(getUrl);
  const lastData = data.length > 0 ? data[data.length - 1] : null;
  const canReadMore = !(lastData && lastData.isLast);
  const empty = data.length > 0 && data[0].values.length === 0;

  return (
    <div>
      {empty && <div className="flex justify-center w-full py-6">コメント履歴がありません</div>}
      {data &&
        data
          .map((d) => d.values)
          .flat()
          .map((d) => <UserComment key={d.id} comment={d} />)}
      {!!error && (
        <div className="flex justify-center w-full py-6 text-red-500 dark:text-red-600">
          コメント履歴の読み込みに失敗しました
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

export default function UserCommentActivity() {
  return (
    <div>
      <UserComments />
    </div>
  );
}
