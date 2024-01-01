import { redirect, RedirectType } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import CreateAccountForm from "@/components/page/create-account-form";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();

  if (session == null) {
    redirect("/auth/signup", RedirectType.replace);
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="会員登録" />
      <SessionProvider session={session}>
        <main className="flex-col-center">
          <section className="flex-col-center px-4 py-4 max-w-4xl">
            <CreateAccountForm />
          </section>
        </main>
      </SessionProvider>
    </div>
  );
}
