import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Breadcrumbs from "@/components/breadcrumbs";
import PrefectureSelect from "@/components/widget/prefecture-select";
import YearMonthDay from "@/components/widget/year-month-day";

export default async function Page() {
  const session = await auth();

  if (session == null) {
    redirect("/auth/signup");
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="会員登録" />
      <main className="flex-col-center">
        <section className="flex-col-center px-4 py-4 max-w-4xl">
          <div className="card w-full p-4 sm:p-7">
            <div className="mb-8">
              <h2>会員情報登録</h2>
              <p className="light-text">以下の項目を入力して下さい。</p>
            </div>
            <form>
              <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
                <div className="sm:col-span-3">
                  <label htmlFor="account-name" className="label mt-1.5">
                    <span className="label-text">アカウント名</span>
                  </label>
                </div>
                <div className="sm:col-span-9">
                  <input id="account-name" type="text" name="accountName" className="input input-bordered w-full" />
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
                        type="radio"
                        name="gender"
                        value="male"
                        className="radio radio-sm mt-0.5"
                      />
                      <span className="text-sm ms-3">男性</span>
                    </label>

                    <label htmlFor="gender-checkbox-female" className="join-item radio-label">
                      <input
                        id="gender-checkbox-female"
                        type="radio"
                        name="gender"
                        value="female"
                        className="radio radio-sm mt-0.5"
                      />
                      <span className="text-sm ms-3">女性</span>
                    </label>
                  </div>
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
                    }}
                    monthSelectProps={{
                      name: "birthMonth",
                    }}
                    daySelectProps={{
                      name: "birthDate",
                    }}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="label mt-1.5" htmlFor="prefecture">
                    <span className="label-text">住所</span>
                  </label>
                </div>
                <div className="sm:col-span-9">
                  <PrefectureSelect id="prefecture" name="prefecture" className="select select-bordered w-32" />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button type="submit" className="btn btn-primary">
                  登録
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
