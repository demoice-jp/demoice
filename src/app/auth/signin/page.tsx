import Breadcrumbs from "@/components/breadcrumbs";
import LineButton from "@/components/widget/line-button";
import { signIn } from "@/lib/auth/auth";

export default function Page() {
  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="ログイン" />
      <main className="fixed-full-with-headers flex-col-center">
        <section className="flex-col-center justify-center h-full max-w-xs md:max-w-sm">
          <div className="card w-full -mt-9 p-6">
            <div className="flex-col-center items-center px-10">
              <form
                className="w-full"
                action={async () => {
                  "use server";
                  await signIn("line", {
                    redirectTo: "/",
                  });
                }}
              >
                <LineButton
                  btnProps={{
                    type: "submit",
                  }}
                  text="LINEでログイン"
                />
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
