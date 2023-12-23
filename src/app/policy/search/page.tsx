import { Suspense } from "react";
import PolicyList, { Skeleton } from "@/app/policy/search/policy-list";

export default async function Page({ searchParams }: { searchParams?: { query?: string; page?: string } }) {
  const query = searchParams?.query || "";
  const pageString = searchParams?.page || "0";
  let page = 0;
  try {
    page = Math.max(0, parseInt(pageString));
  } catch (e) {}

  return (
    <div className="flex-col-center">
      <main className="flex-col-center">
        <section className="flex-col-center px-3 mt-8 md:w-[46rem]">
          <div className="w-full">
            <span className="text-xl">{query || "全ての政策"}の検索結果</span>
          </div>
          <div className="py-6 w-full">
            <Suspense key={query} fallback={<Skeleton />}>
              <PolicyList query={query} page={page} />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
