import { signOut } from "@/auth";
import Breadcrumbs from "@/components/breadcrumbs";

export default function Page() {
  return (
    <div className="flex w-full items-center justify-center flex-col">
      <Breadcrumbs currentPage="ログアウト" />
      <main className="w-full h-full">
        <section className="w-full h-[calc(100vh_-_95px)]">
          <div className="flex flex-col h-full items-center justify-center px-6 py-8 mx-auto lg:py-0 sm:max-w-md">
            <div className="w-full bg-white rounded-lg shadow dark:border -mt-9 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <div className="flex flex-col justify-center items-center mx-10">
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
          </div>
        </section>
      </main>
    </div>
  );
}
