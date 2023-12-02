import { cache } from "react";
import { PolicyDraft } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

export type PolicyDraftSummary = Pick<PolicyDraft, "id" | "summary" | "authorId" | "contentString">;

export const getPolicyDraftSummary = cache(async (): Promise<PolicyDraftSummary[]> => {
  const session = await auth();
  if (!session?.valid) {
    return [];
  }

  return prisma.policyDraft.findMany({
    select: {
      id: true,
      summary: true,
      authorId: true,
      contentString: true,
    },
    where: {
      authorId: session.user!.accountId,
    },
  });
});
