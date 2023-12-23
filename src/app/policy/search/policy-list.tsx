import clsx from "clsx";
import Link from "next/link";
import ContentImage from "@/components/widget/content-image";
import { searchPolicy } from "@/lib/data/policy";

const PAGE_SIZE = 18;

type PolicyListProp = {
  query: string;
  page: number;
};

export default async function PolicyList({ query, page }: PolicyListProp) {
  const policies = await searchPolicy({
    query,
    size: PAGE_SIZE,
    from: PAGE_SIZE * page,
  });

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="grid md:grid-cols-3 w-full gap-3">
        {policies.policies.map((policy) => (
          <Link key={policy.id} href={`/policy/${policy.id}/${encodeURI(policy.title)}`}>
            <div
              className={clsx(
                "flex flex-col rounded-lg overflow-hidden bg-white dark:bg-gray-900",
                policy.image && "h-[21rem]",
                !policy.image && "h-32",
                "md:h-64",
              )}
            >
              {policy.image && <ContentImage contentImage={policy.image} className="rounded-t-lg" />}
              <div className="flex flex-col gap-1 m-1 overflow-hidden">
                <div className="text-lg font-bold">{policy.title}</div>
                <div className="text-sm">{policy.contentString.substring(0, 500)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-between">
        <Link
          href={`/policy/search?${new URLSearchParams({
            query,
            page: String(page - 1),
          }).toString()}`}
          className={clsx("btn btn-primary", page <= 0 && "invisible")}
        >
          前のページ
        </Link>
        <Link
          href={`/policy/search?${new URLSearchParams({
            query,
            page: String(page + 1),
          }).toString()}`}
          className={clsx("btn  btn-primary", !policies.isLast && "invisible")}
        >
          次のページ
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton flex flex-col rounded-lg h-[21rem] md:h-64" />;
}

export function Skeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-3 w-full">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
