"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession, getSession } from "next-auth/react";
import { useFormState } from "react-dom";
import FormError from "@/components/widget/form-error";
import PrefectureSelect from "@/components/widget/prefecture-select";
import SubmitButton from "@/components/widget/submit-button";
import YearMonthDay from "@/components/widget/year-month-day";
import { createAccount } from "@/lib/action/account-action";

export default function CreateAccountForm() {
  const [state, dispatch] = useFormState(createAccount, {});
  const { data: session } = useSession();
  const { replace, refresh } = useRouter();

  useEffect(() => {
    if (!state.success && session?.valid) {
      signOut({
        redirect: false, //signOutと同時にリダイレクトするとTypeError: Response body object should not be disturbed or lockedになるため
      }).then(() => {
        replace("/auth/signup?error=DUPLICATED_ACCOUNT");
        refresh();
      });
    }
  }, [state, session, replace, refresh]);

  // Serverコンポーネントではセッションを取得してもJWTは書き変わらず、JWT取得時のDBアクセスが無駄に続いてしまうので、
  // クライアント側でセッションを更新してからリダイレクトすることで解決する。
  useEffect(() => {
    if (state.success) {
      getSession().then(() => {
        // updateと一緒にrefreshを呼ぶと挙動がおかしいため。
        replace("/");
        refresh();
      });
    }
  }, [state, replace, refresh]);

  if (!session || session.valid || state.success) {
    return <span className="loading loading-dots loading-lg" />;
  }

  return (
    <div className="card w-full p-4 sm:p-7">
      <div className="mb-8">
        <h2>会員情報登録</h2>
        <p className="light-text">以下の項目を入力して下さい。</p>
      </div>
      <form action={dispatch}>
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
              className="single-line-input w-full"
              required
              minLength={3}
              maxLength={15}
            />
            <FormError id="user-name-error" messages={state.errors?.userName} />
          </div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5">
              <span className="label-text">性別</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <div className="join">
              <label htmlFor="gender-checkbox-male" className="join-item radio-label">
                <input
                  id="gender-checkbox-male"
                  aria-describedby="gender-error"
                  type="radio"
                  name="gender"
                  value="male"
                  className="radio radio-sm mt-0.5"
                  required
                />
                <span className="text-sm ms-3">男性</span>
              </label>

              <label htmlFor="gender-checkbox-female" className="join-item radio-label">
                <input
                  id="gender-checkbox-female"
                  aria-describedby="gender-error"
                  type="radio"
                  name="gender"
                  value="female"
                  className="radio radio-sm mt-0.5"
                  required
                />
                <span className="text-sm ms-3">女性</span>
              </label>
            </div>
            <FormError id="gender-error" messages={state.errors?.gender} />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="birth-year" className="label mt-1.5">
              <span className="label-text">生年月日</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <YearMonthDay
              yearSelectProps={{
                id: "birth-year",
                name: "birthYear",
                "aria-describedby": "birth-date-error",
              }}
              monthSelectProps={{
                name: "birthMonth",
              }}
              daySelectProps={{
                name: "birthDate",
              }}
            />
            <FormError id="birth-date-error" messages={state.errors?.birthDate} />
          </div>

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
            />
            <FormError id="prefecture-error" messages={state.errors?.prefecture} />
          </div>
        </div>
        {state.message && (
          <div className="w-full flex justify-end">
            <FormError messages={[state.message]} />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <SubmitButton>登録</SubmitButton>
        </div>
      </form>
    </div>
  );
}
