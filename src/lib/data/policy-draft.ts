import { cache } from "react";
import { Content } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

export type PolicyDraftSummary = Pick<Content, "id" | "summary" | "authorId" | "contentString">;

export const getPolicyDraftSummaries = cache(async (): Promise<PolicyDraftSummary[]> => {
  const session = await auth();
  if (!session?.valid) {
    return [];
  }

  return prisma.content.findMany({
    select: {
      id: true,
      summary: true,
      authorId: true,
      contentString: true,
    },
    where: {
      authorId: session.user!.accountId,
    },
    orderBy: {
      createdDate: "desc",
    },
  });
});

export const getPolicyDraft = cache(async (id: string) => {
  const session = await auth();
  if (!session?.valid) {
    return null;
  }

  return prisma.content.findUnique({
    where: {
      id,
      authorId: session.user!.accountId,
    },
  });
});
