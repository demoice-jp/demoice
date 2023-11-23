import { signOut } from "@/auth";
import Breadcrumbs from "@/components/breadcrumbs";

export default function Page() {
  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="ログアウト" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9">
            <div className="p-6">
              <div className="flex-col-center items-center px-10">
                <form
                  className="w-full"
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
