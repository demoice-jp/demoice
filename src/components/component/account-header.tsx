"use client";

import { useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NOT_DISPLAY_PATH = ["/auth/signup", "/auth/signin", "/account/register"];

type AccountHeaderProp = {
  user: User | null;
};

export default function AccountHeader({ user }: AccountHeaderProp) {
  const pathName = usePathname();
  const { refresh } = useRouter();

  useEffect(() => {
    if (pathName === "/auth/signup") {
      // サインアップ時にアカウント2重登録でヘッダをリフレッシュする必要があるため。
      // refreshと同時にreplaceを行うことができないのでここでrefreshを行う。
      refresh();
    }
  }, [pathName, refresh]);

  if (NOT_DISPLAY_PATH.includes(pathName)) {
    return null;
  }

  if (user) {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost">
          <UserCircleIcon height={24} />
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
        <Link className="btn btn-sm" href="/auth/signin">
          ログイン
        </Link>
        <Link className="btn btn-sm" href="/auth/signup">
          会員登録
        </Link>
      </div>
    );
  }
}
