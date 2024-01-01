import Breadcrumbs from "@/components/widget/breadcrumbs";
import { signOut } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="ログアウト" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9 p-6">
            <form
              className="w-full px-10"
              action={async () => {
                "use server";
                await signOut({
                  redirectTo: "/",
                });
              }}
            >
              <button type="submit" className="btn btn-primary w-full">
                ログアウト
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
