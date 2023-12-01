import { redirect, RedirectType } from "next/navigation";
import PostSignin from "@/components/page/post-signin";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { auth } from "@/lib/auth/auth";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    callback?: string;
  };
}) {
  const session = await auth();
  if (session?.valid) {
    redirect(searchParams?.callback ? searchParams.callback : "/", RedirectType.replace);
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="ログイン" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <PostSignin callback={searchParams?.callback} />;
        </section>
      </main>
    </div>
  );
}
