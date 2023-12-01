import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

export const getUser = cache(async () => {
  const session = await auth();
  if (!session?.valid) {
    return null;
  }
  return prisma.user.findUnique({
    where: {
      id: session.user!.accountId,
    },
  });
});
