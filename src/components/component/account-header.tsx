import { UserCircleIcon } from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import Link from "next/link";

type AccountHeaderProp = {
  user: User;
};

export default async function AccountHeader({ user }: AccountHeaderProp) {
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
}
