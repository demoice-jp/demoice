import Image from "next/image";
import Link from "next/link";

type HeaderLinkProp = {
  text: string;
  href: string;
};
function HeaderLink({ text, href }: HeaderLinkProp) {
  return (
    <Link
      className="inline-flex items-center text-gray-800 p-2 text-sm font-medium rounded-lg hover:text-orange-500 focus:outline-none focus:text-orange-500 dark:text-gray-200 dark:hover:text-gray-400 dark:focus:text-gray-400"
      href={href}
    >
      {text}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 dark:bg-gray-800 dark:border-gray-700">
      <nav
        className="relative max-w-[85rem] w-full mx-auto px-4 flex items-center justify-between sm:px-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-2 md:gap-x-3">
          <Link className="flex-none rounded-md dark:focus:outline-none" href="/">
            <Image src="/demoice.svg" alt="Demoice Logo" width={132} height={30} />
          </Link>
        </div>
        <div className="flex items-center gap-x-3">
          <HeaderLink text="ログイン" href="/login" />
          <HeaderLink text="会員登録" href="/signup" />
        </div>
      </nav>
    </header>
  );
}
