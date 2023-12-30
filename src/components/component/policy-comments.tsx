"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormState } from "react-dom";
import useSWRImmutable from "swr/immutable";
import useSWRInfinite from "swr/infinite";
import { CommentResponse } from "@/app/api/policy/[id]/comment/route";
import Comment from "@/components/widget/comment";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import UserLink from "@/components/widget/user-link";
import { postComment, Comment as CommentType } from "@/lib/action/policy-action";
import { swrFetcher } from "@/lib/util/util";

const MAX_COMMENT_LENGTH = 500;

type PolicyCommentsProp = {
  id: string;
  user?: User;
};

type onPost = (comment: CommentType) => void;

function CommentPost({ id, user, onPost }: { id: string; user?: User; onPost: onPost }) {
  const [value, setValue] = useState("");
  const [postState, dispatch] = useFormState(postComment, {
    success: null,
  });
  const pathName = usePathname();

  useEffect(() => {
    if (postState && postState.success) {
      onPost(postState.comment);
      setValue("");
    }
  }, [postState, onPost]);

  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  if (!user) {
    return (
      <div className="p-4 flex w-full justify-center">
        <Link
          href={`/auth/signin?${new URLSearchParams({
            callback: pathName,
          })}`}
          className="btn btn-primary"
        >
          コメント投稿
        </Link>
      </div>
    );
  }

  return (
    <form className="p-4" action={dispatch}>
      <UserLink user={user} size="small" />
      <div>
        <input type="hidden" name="policyId" value={id} />
        <textarea
          name="comment"
          value={value}
          required
          className="textarea bg-white dark:bg-black w-full min-h-[3rem] border-none focus:outline-none resize-none leading-snug"
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="政策についてコメントする"
          onChange={onChange}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {value.length}/{MAX_COMMENT_LENGTH}文字
        </span>
        <div className="flex gap-2 items-center">
          <SubmitButton className="btn btn-primary btn-sm">コメント投稿</SubmitButton>
        </div>
      </div>
      {postState.success === false && (
        <div className="w-full flex justify-end">
          <FormError messages={postState.message} />
        </div>
      )}
    </form>
  );
}

function CommentCount({ id, posted }: { id: string; posted: CommentType[] }) {
  const { data, isLoading, error } = useSWRImmutable<{
    count: number;
  }>(`/api/policy/${id}/comment/count`, swrFetcher);

  let inner = null;
  if (isLoading) {
    inner = <div className="skeleton rounded h-[1.5rem] w-36" />;
  } else if (error) {
    inner = <div className="text-red-500 dark:text-red-600">コメント件数を取得できませんでした</div>;
  } else if (data) {
    inner = (
      <>
        <span className="material-symbols-outlined">comment</span>
        <span>コメント{data.count + posted.length}件</span>
      </>
    );
  }

  return <div className="border-t-2 border-gray-100 dark:border-gray-900 p-4 flex items-center gap-1">{inner}</div>;
}

function Comments({ id, posted }: { id: string; posted: CommentType[] }) {
  const { data, error, isLoading, mutate, size, setSize } = useSWRInfinite<CommentResponse>(
    (pageIndex, previousPageData: CommentResponse | null) => {
      if (previousPageData && previousPageData.isLast) {
        return null;
      }
      return `/api/policy/${id}/comment?page=${pageIndex}`;
    },
    swrFetcher,
    {
      revalidateFirstPage: false,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    },
  );

  const lastData = data && data.length > 0 ? data[data.length - 1] : null;
  const canReadMore = !(lastData && lastData.isLast);
  const empty = posted.length === 0 && data && data.length > 0 && data[0].values.length === 0;
  const loading = isLoading || (data && data.length < size);

  return (
    <div>
      {empty && <div className="flex justify-center w-full pt-2 pb-6">コメントはまだありません</div>}
      {posted.map((p) => (
        <Comment key={p.id} comment={p} />
      ))}
      {data &&
        data
          .map((d) => d.values)
          .flat()
          .map((d) => <Comment key={d.id} comment={d} />)}
      {error && (
        <div className="flex justify-center w-full pt-2 pb-6 text-red-500 dark:text-red-600">
          コメントの読み込みに失敗しました
        </div>
      )}
      {loading ? (
        <div className="w-full p-4">
          <div className="skeleton rounded h-[5rem] w-full" />
        </div>
      ) : (
        (canReadMore || error) && (
          <div className="flex p-4 justify-center w-full">
            {canReadMore ? (
              <button className="btn btn-sm btn-primary" onClick={() => setSize(size + 1)}>
                さらに表示
              </button>
            ) : (
              error && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    mutate();
                  }}
                >
                  再読み込み
                </button>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function PolicyComments({ user, id }: PolicyCommentsProp) {
  const [posted, setPosted] = useState<CommentType[]>([]);
  const onPost = useCallback((comment: CommentType) => {
    setPosted((p) => [comment, ...p]);
  }, []);

  return (
    <div>
      <CommentPost id={id} user={user} onPost={onPost} />
      <CommentCount id={id} posted={posted} />
      <Comments id={id} posted={posted} />
    </div>
  );
}
