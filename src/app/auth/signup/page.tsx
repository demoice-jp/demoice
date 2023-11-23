import Link from "next/link";
import { signIn } from "@/auth";
import Breadcrumbs from "@/components/breadcrumbs";
import LineButton from "@/components/widget/line-button";

export default function Page() {
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
