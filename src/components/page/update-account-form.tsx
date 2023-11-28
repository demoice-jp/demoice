"use client";

import { useEffect } from "react";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import FormError from "@/components/widget/form-error";
import PrefectureSelect from "@/components/widget/prefecture-select";
import SubmitButton from "@/components/widget/submit-button";
import SubmitCancelButton from "@/components/widget/submit-cancel-button";
import { deleteAccount, updateAccount } from "@/lib/action/account-action";

type UpdateAccountFormProp = {
  user: User;
};

export default function UpdateAccountForm({ user }: UpdateAccountFormProp) {
  const [updateState, updateDispatch] = useFormState(updateAccount, {});
  const [deleteState, deleteDispatch] = useFormState(deleteAccount, {});
  const { refresh } = useRouter();

  useEffect(() => {
    if (updateState.success) {
      refresh();
    }
  }, [updateState, refresh]);

  return (
    <div className="card w-full p-4 sm:p-7">
      <div className="mb-8">
        <h2>会員情報更新</h2>
        <p className="light-text">以下の項目を入力して下さい。</p>
      </div>
      <form action={updateDispatch}>
        <input type="hidden" name="id" value={user.id} />
        <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
          <div className="sm:col-span-3">
            <label htmlFor="user-name" className="label mt-1.5">
              <span className="label-text">ユーザー名</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <input
              id="user-name"
              aria-describedby="user-name-error"
              type="text"
              name="userName"
              className="input input-bordered w-full"
              required
              minLength={3}
              maxLength={15}
              defaultValue={user.userName}
            />
            <FormError id="user-name-error" messages={updateState.errors?.userName} />
          </div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5">
              <span className="label-text">性別</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">{user.gender === "male" ? "男性" : "女性"}</div>

          <div className="sm:col-span-3">
            <label htmlFor="birth-year" className="label mt-1.5">
              <span className="label-text">生年月日</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">{dayjs(user.birthDate).format("YYYY年MM月DD日")}</div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5" htmlFor="prefecture">
              <span className="label-text">都道府県(住所)</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <PrefectureSelect
              id="prefecture-error"
              aria-describedby="prefecture"
              name="prefecture"
              className="select select-bordered w-32"
              required
              defaultValue={user.prefecture}
            />
            <FormError id="prefecture-error" messages={updateState.errors?.prefecture} />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="birth-year" className="label mt-1.5">
              <span className="label-text">登録日</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">{dayjs(user.createdDate).format("YYYY年MM月DD日")}</div>
        </div>
        {updateState.message && (
          <div className="w-full flex justify-end">
            <FormError messages={[updateState.message]} />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <SubmitButton>更新</SubmitButton>
        </div>
        {updateState.success && (
          <div className="w-full flex justify-end">
            <p className="mt-2 text-sm">会員情報を更新しました。</p>
          </div>
        )}
      </form>
      {/* 以下アカウント削除フォーム */}
      <div className="mt-24 flex justify-end">
        <button
          className="btn btn-outline btn-error"
          onClick={() => {
            if (document) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              (document.getElementById("delete-account-modal") as HTMLFormElement)?.showModal();
            }
          }}
        >
          アカウント削除
        </button>
      </div>
      <dialog id="delete-account-modal" className="modal">
        <div className="modal-box">
          <p>この操作は元に戻すことができません。本当にアカウントを削除してもよろしいでしょうか？</p>
          <form action={deleteDispatch} className="mt-4 flex gap-4 justify-end">
            <input type="hidden" name="id" value={user.id} />
            <SubmitCancelButton
              onClick={(e) => {
                e.preventDefault();
                if (document) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  (document.getElementById("delete-account-modal") as HTMLFormElement)?.close();
                }
              }}
            >
              キャンセル
            </SubmitCancelButton>
            <SubmitButton className="btn btn-error">アカウント削除</SubmitButton>
          </form>
          {deleteState.message && (
            <div className="flex justify-end">
              <FormError messages={[deleteState.message]} />
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
