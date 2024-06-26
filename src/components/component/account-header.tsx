"use client";

import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import UserAvatar from "@/components/widget/user-avatar";

type AccountHeaderProp = {
  user: User | null;
};

export default function AccountHeader({ user }: AccountHeaderProp) {
  const pathName = usePathname();
  const searchParams = useSearchParams();

  if (user) {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost rounded-full btn-sm w-12 h-12 p-1">
          <UserAvatar user={user} size={64} />
        </div>
        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
          <div className="truncate w-full mb-1 mt-0.5 mx-0.5 font-bold">{user.userName}</div>
          <li>
            <Link href="/account/update">会員情報更新</Link>
          </li>
          <li>
            <Link href="/auth/signout">ログアウト</Link>
          </li>
        </ul>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-x-3">
        <Link
          className="btn btn-sm"
          href={`/auth/signin?${new URLSearchParams({
            callback: `${pathName}${searchParams.size === 0 ? "" : `?${searchParams}`}`,
          })}`}
        >
          ログイン
        </Link>
        <Link className="btn btn-sm hidden sm:inline-flex" href="/auth/signup">
          会員登録
        </Link>
      </div>
    );
  }
}
