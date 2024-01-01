import { Suspense } from "react";
import clsx from "clsx";
import Link from "next/link";
import PolicyCard, { SkeletonCard } from "@/components/widget/policy-card";
import SearchOrderSelect from "@/components/widget/search-order-select";
import { searchPolicy, SearchPolicyProp } from "@/lib/data/policy";

const PAGE_SIZE = 18;
const ORDERS: SearchPolicyProp["sort"][] = ["trend", "votes", "created", "score"];

type PolicyListProp = {
  query: string;
  page: number;
  order: SearchPolicyProp["sort"];
};

async function PolicyList({ query, page, order }: PolicyListProp) {
  const policies = await searchPolicy({
    query,
    sort: order,
    size: PAGE_SIZE,
    from: PAGE_SIZE * page,
  });

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 w-full gap-3">
        {policies.policies.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
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
          className={clsx("btn  btn-primary", policies.isLast && "invisible")}
        >
          次のページ
        </Link>
      </div>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
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

export default async function Page({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string; order?: string };
}) {
  const query = searchParams?.query || "";
  const pageString = searchParams?.page || "0";
  const orderString = searchParams?.order || "trend";
  let page = 0;
  try {
    page = Math.max(0, parseInt(pageString));
  } catch (e) {}

  let order = ORDERS.find((o) => o === orderString);
  if (!order) {
    order = "trend";
  }

  return (
    <div className="flex-col-center">
      <main className="flex-col-center">
        <section className="flex-col-center px-3 mt-8 md:w-[46rem]">
          <div className="w-full flex justify-between">
            <span className="text-xl pt-1.5">{query || "全ての政策"}の検索結果</span>
            <SearchOrderSelect currentOrder={order} />
          </div>
          <div className="py-6 w-full">
            <Suspense key={query} fallback={<Skeleton />}>
              <PolicyList query={query} page={page} order={order} />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
