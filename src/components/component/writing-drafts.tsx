"use client";
import clsx from "clsx";
import Link from "next/link";
import { useFormState } from "react-dom";
import ContentImage from "@/components/widget/content-image";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import SubmitCancelButton from "@/components/widget/submit-cancel-button";
import { deletePolicyDraft, DeletePolicyDraftState } from "@/lib/action/policy-draft-action";
import { ContentTitle } from "@/lib/data/content";

type WritingDraftsProp = {
  writingDrafts: ContentTitle[];
};

export default function WritingDrafts({ writingDrafts }: WritingDraftsProp) {
  const [draftsState, deleteDispatch] = useFormState(deletePolicyDraft, {
    policyDrafts: writingDrafts,
  });

  if (draftsState.policyDrafts.length === 0) {
    return <div className="card w-full h-16 items-center justify-center">記載途中の投稿はありません</div>;
  }

  return (
    <div className="flex-col-center w-full gap-3">
      {draftsState.policyDrafts.map((draft) => (
        <WritingDraft key={draft.id} writingDraft={draft} deleteDispatch={deleteDispatch} error={draftsState.error} />
      ))}
    </div>
  );
}

function WritingDraft({
  writingDraft,
  deleteDispatch,
  error,
}: {
  writingDraft: ContentTitle;
  deleteDispatch: (payload: FormData) => void;
  error: DeletePolicyDraftState["error"];
}) {
  const href = `/policy/create/${writingDraft.id}/title`;
  const modalId = `delete_modal_${writingDraft.id}`;
  const title = writingDraft.title || "概要の記載がありません";

  return (
    <form className="card w-full flex-row h-32 overflow-hidden" action={deleteDispatch}>
      <input type="hidden" name="id" value={writingDraft.id} />
      <Link href={href} className="flex flex-1 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden">
          <ContentImage contentImage={writingDraft.image} className="h-full w-auto" />
          <div className="flex flex-col gap-1 py-3 pl-3 overflow-hidden">
            <span className={clsx("text-lg truncate", !writingDraft.title && "text-gray-500 dark:text-gray-400")}>
              {title}
            </span>
            {writingDraft.contentString ? (
              <span>
                {writingDraft.contentString.substring(0, 50)}
                {writingDraft.contentString.length > 50 && "..."}
              </span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">内容の記載がありません</span>
            )}
          </div>
        </div>
      </Link>
      <div className="dropdown dropdown-end flex-initial">
        <div tabIndex={0} role="button" className="btn btn-ghost">
          <span className="material-symbols-outlined">menu</span>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-24">
          <li>
            <Link href={href}>編集</Link>
          </li>
          <li>
            <span
              onClick={() => {
                if (document) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  (document.getElementById(modalId) as HTMLFormElement)?.showModal();
                }
              }}
            >
              削除
            </span>
          </li>
        </ul>
      </div>
      <dialog id={modalId} className="modal">
        <div className="modal-box">
          <p>本当に「{`${title}`}」を削除してもよろしいでしょうか？</p>
          {error?.draftId === writingDraft.id && <FormError messages={[error!.message]} />}
          <div className="modal-footer-buttons">
            <SubmitCancelButton
              onClick={(e) => {
                e.preventDefault();
                if (document) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  (document.getElementById(modalId) as HTMLFormElement)?.close();
                }
              }}
            >
              キャンセル
            </SubmitCancelButton>
            <SubmitButton className="btn btn-error">削除</SubmitButton>
          </div>
        </div>
      </dialog>
    </form>
  );
}
