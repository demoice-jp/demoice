import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect(
      `/auth/signin?${new URLSearchParams({
        callback: "/policy/create",
      })}`,
    );
  }

  return <div className="flex-col-center">{children}</div>;
}
