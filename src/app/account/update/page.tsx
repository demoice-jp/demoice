import { redirect } from "next/navigation";
import UpdateAccountForm from "@/components/page/update-account-form";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { getUser } from "@/lib/data/user";

export default async function Page() {
  const user = await getUser();
  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="会員情報更新" />
      <main className="flex-col-center">
        <section className="flex-col-center px-4 py-4 max-w-4xl">
          <UpdateAccountForm user={user} />
        </section>
      </main>
    </div>
  );
}
