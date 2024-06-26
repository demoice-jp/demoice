import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import DemoiceLogo from "@/asset/demoice.svg";
import AccountHeader from "@/components/component/account-header";
import HeaderSearch from "@/components/component/header-search";
import HideHeaderItems from "@/components/component/hide-header-items";
import { getUser } from "@/lib/data/user";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="sticky h-14 top-0 flex flex-nowrap sm:justify-start z-50 w-full bg-white border-b border-gray-200 text-sm py-3 dark:bg-gray-800 dark:border-gray-700">
      <nav
        className="relative max-w-[85rem] w-full mx-auto px-4 flex items-center justify-between sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-2 md:gap-x-3">
          <Link className="flex-none dark:focus:outline-none" href="/">
            <Image src={DemoiceLogo} alt="Demoice Logo" priority />
          </Link>
        </div>
        <HideHeaderItems>
          <div className="flex gap-x-4">
            <HeaderSearch />
            <div className={clsx("flex items-center", !user && "hidden md:flex")}>
              <Link className="btn btn-primary btn-sm min-h-[2.25rem] h-9" href="/policy/create">
                <span className="hidden md:inline">投稿する</span>
                <div className="md:hidden">
                  <span className="material-symbols-outlined">add</span>
                </div>
              </Link>
            </div>
            <AccountHeader user={user} />
          </div>
        </HideHeaderItems>
      </nav>
    </header>
  );
}
