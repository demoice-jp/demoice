import React from "react";
import { redirect } from "next/navigation";
import Breadcrumbs from "@/components/widget/breadcrumbs";
import { auth } from "@/lib/auth/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect(
      `/auth/signin?${new URLSearchParams({
        callback: "/policy/create/step0",
      })}`,
    );
  }

  return (
    <div className="flex-col-center">
      <Breadcrumbs currentPage="新規投稿" />
      <main className="flex-col-center">
        <section className="flex-col-center justify-center">{children}</section>
      </main>
    </div>
  );
}
