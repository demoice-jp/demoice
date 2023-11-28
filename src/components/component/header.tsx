import Image from "next/image";
import Link from "next/link";
import AccountHeader from "@/components/component/account-header";
import { getUser } from "@/lib/data/user";

type HeaderLinkProp = {
  text: string;
  href: string;
};
function HeaderLink({ text, href }: HeaderLinkProp) {
  return (
    <Link className="btn btn-sm" href={href}>
      {text}
    </Link>
  );
}

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
        {user ? (
          <AccountHeader user={user} />
        ) : (
          <div className="flex items-center gap-x-3">
            <HeaderLink text="ログイン" href="/auth/signin" />
            <HeaderLink text="会員登録" href="/auth/signup" />
          </div>
        )}
      </nav>
    </header>
  );
}
