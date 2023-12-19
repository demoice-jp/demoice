import { cache } from "react";
import prisma from "@/lib/orm/client";

export const getPolicyByContentId = cache(async (contentId: string) => {
  return prisma.policy.findUnique({
    where: {
      contentId,
    },
    include: {
      content: true,
    },
  });
});
