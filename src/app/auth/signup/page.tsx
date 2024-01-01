import Link from "next/link";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import FormError from "@/components/widget/form-error";
import LineButton from "@/components/widget/line-button";
import { signIn } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

function errorCodeToMessage(code: string) {
  switch (code) {
    case "DUPLICATED_ACCOUNT":
      return "このアカウントは既に登録されています。";
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
      <Breadcrumbs currentPage="会員登録" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9 p-6">
            <div className="flex-col-center items-center px-10">
              <form
                className="w-full"
                action={async () => {
                  "use server";
                  await signIn("line", {
                    redirectTo: "/account/register",
                  });
                }}
              >
                <LineButton
                  btnProps={{
                    type: "submit",
                  }}
                  text="LINEで会員登録"
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
          <Link className="link link-hover" href="/auth/signin">
            ログインはこちら
          </Link>
        </section>
      </main>
    </div>
  );
}
