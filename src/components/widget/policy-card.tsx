import clsx from "clsx";
import Link from "next/link";
import ContentImage from "@/components/widget/content-image";
import { PolicySummary } from "@/lib/data/policy";

type PolicyCardProp = {
  policy: PolicySummary;
};

export default function PolicyCard({ policy }: PolicyCardProp) {
  return (
    <Link className="flex-col-center" href={`/policy/${policy.id}/${encodeURI(policy.title)}`}>
      <div
        className={clsx(
          "flex flex-col w-full max-w-[24rem] sm:max-w-[18rem] rounded-lg overflow-hidden bg-white dark:bg-black",
          policy.image && "h-[21rem]",
          !policy.image && "h-32",
          "sm:h-64",
        )}
      >
        {policy.image && <ContentImage contentImage={policy.image} className="rounded-t-lg" />}
        <div className="flex flex-col gap-1 m-1 overflow-hidden">
          <div className="text-lg font-bold">{policy.title}</div>
          <div className="text-sm">{policy.contentString.substring(0, 500)}</div>
        </div>
      </div>
    </Link>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex-col-center">
      <div className="skeleton flex flex-col w-full rounded-lg max-w-[24rem] sm:max-w-[18rem] h-[21rem] sm:h-64" />
    </div>
  );
}
