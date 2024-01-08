import Link from "next/link";
import { redirect } from "next/navigation";
import AccountActivity from "@/components/component/account-activity";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import UserAvatar from "@/components/widget/user-avatar";
import XIcon from "@/components/widget/x-icon";
import { getUser } from "@/lib/data/user";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getUser();
  if (!user) {
    redirect(
      `/auth/signin?${new URLSearchParams({
        callback: "/account/activity",
      })}`,
    );
  }

  return (
    <div>
      <Breadcrumbs currentPage="アクティビティ" />
      <main className="flex-col-center w-full p-2">
        <div className="flex flex-col rounded w-full md:w-[40rem] bg-white dark:bg-black">
          <div className="p-2 flex">
            <div className="w-[64px] h-[64px] md:w-[128px] md:h-[128px]">
              <UserAvatar
                user={{
                  id: user.id,
                  avatar: user.avatar,
                }}
                size={128}
              />
            </div>
            <div className="px-2 md:p-3">
              <div className="font-bold text-lg">{user.userName}</div>
              <pre className="text-sm break-all">{user.introduction}</pre>
              <div className="mt-2 flex gap-3 items-center">
                {user.xUserName && (
                  <Link
                    className="flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://twitter.com/${user.xUserName}`}
                  >
                    <XIcon className="h-[1.2rem] inline fill-black dark:fill-gray-400" />
                  </Link>
                )}
                {user.webSite && (
                  <Link className="flex items-center" rel="noopener noreferrer" target="_blank" href={user.webSite}>
                    <span className="material-symbols-outlined dark:text-gray-400">link</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <AccountActivity />
        </div>
      </main>
    </div>
  );
}
