import Link from "next/link";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import FormError from "@/components/widget/form-error";
import LineButton from "@/components/widget/line-button";
import { signIn } from "@/lib/auth/auth";

function errorCodeToMessage(code: string) {
  switch (code) {
    case "NO_ACCOUNT":
      return "このアカウントは登録されていません。";
    default:
      return "予期しないエラーが発生しました。";
  }
}

export default function Page({
  searchParams,
}: {
  searchParams?: {
    error?: string;
  };
}) {
  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="ログイン" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9 p-6">
            <div className="flex-col-center items-center px-10">
              <form
                className="w-full"
                action={async () => {
                  "use server";
                  await signIn("line", {
                    redirectTo: "/auth/post-signin",
                  });
                }}
              >
                <LineButton
                  btnProps={{
                    type: "submit",
                  }}
                  text="LINEでログイン"
                />
              </form>
            </div>
            {searchParams?.error && (
              <div className="w-full flex justify-center">
                <FormError messages={[errorCodeToMessage(searchParams.error)]} />
              </div>
            )}
          </div>
          <div className="divider" />
          <Link className="link link-hover" href="/auth/signup">
            新規会員登録はこちら
          </Link>
        </section>
      </main>
    </div>
  );
}
