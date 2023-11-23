import Image from "next/image";
import Link from "next/link";
import LineLogo from "@/asset/line_64.png";
import { signIn } from "@/auth";
import Breadcrumbs from "@/components/breadcrumbs";

export default function Page() {
  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="会員登録" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9">
            <div className="p-6">
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
                  <button
                    type="submit"
                    className="w-full flex text-white bg-[#06C755] rounded active:[&>div]:bg-black active:[&>div]:bg-opacity-30"
                  >
                    <div className="flex flex-row w-full h-full rounded hover:bg-black hover:bg-opacity-10">
                      <div className="flex h-12 w-12 border-r-2 border-black border-opacity-[0.08]">
                        <Image src={LineLogo} alt="Line logo" />
                      </div>
                      <span className="self-center flex-grow">LINEで会員登録</span>
                    </div>
                  </button>
                </form>
              </div>
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
