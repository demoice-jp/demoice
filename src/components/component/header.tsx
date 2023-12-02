import Image from "next/image";
import Link from "next/link";
import AccountHeader from "@/components/component/account-header";
import HideHeaderItems from "@/components/component/hide-header-items";
import { getUser } from "@/lib/data/user";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="sticky h-14 top-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 dark:bg-gray-800 dark:border-gray-700">
      <nav
        className="relative max-w-[85rem] w-full mx-auto px-4 flex items-center justify-between sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-2 md:gap-x-3">
          <Link className="flex-none dark:focus:outline-none" href="/">
            <Image src="/demoice.svg" alt="Demoice Logo" width={132} height={30} />
          </Link>
        </div>
        <HideHeaderItems>
          <div className="flex gap-x-4">
            <Link className="btn btn-primary btn-sm" href="/policy/create">
              新規投稿
            </Link>
            <AccountHeader user={user} />
          </div>
        </HideHeaderItems>
      </nav>
    </header>
  );
}
