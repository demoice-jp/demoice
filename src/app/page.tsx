import { Suspense } from "react";
import Link from "next/link";
import PolicyCard, { SkeletonCard } from "@/components/widget/policy-card";
import { searchPolicy } from "@/lib/data/policy";

const POLICY_SIZE = 6;

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex-col-center py-6">
      <div className="flex flex-col w-full gap-14 px-3 md:w-[46rem]">
        <div className="w-full">
          <h2>トレンドの政策</h2>
          <Suspense fallback={<Skeleton />}>
            <div className="flex-col-center w-full gap-2">
              <PolicyList order="trend" />
              <Link href="/policy/search?q=&order=trend" className="link">
                トレンドをもっと見る
              </Link>
            </div>
          </Suspense>
        </div>
        <div className="w-full">
          <h2>新しく投稿された政策</h2>
          <Suspense fallback={<Skeleton />}>
            <div className="flex-col-center w-full gap-2">
              <PolicyList order="created" />
              <Link href="/policy/search?q=&order=created" className="link">
                新しい投稿をもっと見る
              </Link>
            </div>
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function PolicyList({ order }: { order: "trend" | "created" }) {
  const policies = await searchPolicy({
    query: "",
    size: POLICY_SIZE,
    sort: order,
    from: 0,
  });

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 w-full gap-3">
      {policies.policies.map((p) => (
        <PolicyCard key={p.id} policy={p} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
