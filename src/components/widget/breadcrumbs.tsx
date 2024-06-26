import Link from "next/link";

type BreadcrumbsProps = {
  interPages?: {
    name: string;
    url: string;
  }[];
  currentPage: string;
};

export default function Breadcrumbs({ currentPage, interPages }: BreadcrumbsProps) {
  return (
    <nav className="w-full max-w-[85rem] px-4 sm:px-6 lg:px-8 text-sm breadcrumbs">
      <ul>
        <li>
          <Link href="/">
            <span className="material-symbols-outlined">home</span>
          </Link>
        </li>
        {interPages &&
          interPages.map((p) => (
            <li key={p.url}>
              <Link href={p.url}>{p.name}</Link>
            </li>
          ))}
        <li>{currentPage}</li>
      </ul>
    </nav>
  );
}
