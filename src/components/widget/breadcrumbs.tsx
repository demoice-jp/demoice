import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

type BreadcrumbsProps = {
  currentPage: string;
};

export default function Breadcrumbs({ currentPage }: BreadcrumbsProps) {
  return (
    <nav className="w-full max-w-[85rem] px-4 sm:px-6 lg:px-8 text-sm breadcrumbs">
      <ul>
        <li>
          <Link href="/">
            <HomeIcon className="h-5 w-5" />
          </Link>
        </li>
        <li>{currentPage}</li>
      </ul>
    </nav>
  );
}
