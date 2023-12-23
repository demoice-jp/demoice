"use client";

import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type AccountHeaderProp = {
  user: User | null;
};

export default function AccountHeader({ user }: AccountHeaderProp) {
  const pathName = usePathname();
  const searchParams = useSearchParams();

  if (user) {
    return (
      <div className="dropdown dropdown-end flex items-center">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm min-h-[2.25rem] h-9">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="max-w-[8rem] truncate">{user.userName}</span>
        </div>
        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
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
        <Link className="btn btn-sm" href="/auth/signup">
          会員登録
        </Link>
      </div>
    );
  }
}
