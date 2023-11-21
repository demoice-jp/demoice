import { HomeIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import LineLogo from "@/asset/line_64.png";

export default function Page() {
  return (
    <div className="flex w-full items-center justify-center flex-col">
      <nav className="w-full max-w-[85rem] px-4 sm:px-6 lg:px-8 text-sm breadcrumbs">
        <ul>
          <li>
            <Link href="/">
              <HomeIcon className="h-5 w-5" />
            </Link>
          </li>
          <li>会員登録</li>
        </ul>
      </nav>
      <main className="w-full h-full">
        <section className="w-full h-[calc(100vh_-_95px)]">
          <div className="flex flex-col h-full items-center justify-center px-6 py-8 mx-auto lg:py-0 sm:max-w-md">
            <div className="w-full bg-white rounded-lg shadow dark:border -mt-9 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1>会員登録</h1>
                <div className="flex flex-col justify-center items-center mx-10">
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
                </div>
              </div>
            </div>
            <div className="divider" />
            <Link className="link link-hover" href="/auth/signin">
              ログインはこちら
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
