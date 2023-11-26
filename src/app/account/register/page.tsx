import { redirect } from "next/navigation";
import CreateAccountForm from "@/components/page/create-account-form";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { auth } from "@/lib/auth/auth";

export default async function Page() {
  const session = await auth();

  if (session == null) {
    redirect("/auth/signup");
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="会員登録" />
      <main className="flex-col-center">
        <section className="flex-col-center px-4 py-4 max-w-4xl">
          <CreateAccountForm />
        </section>
      </main>
    </div>
  );
}
