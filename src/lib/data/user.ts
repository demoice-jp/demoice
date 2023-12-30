import { cache } from "react";
import { User } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

export const getUser = cache(async (accountId?: string) => {
  let id = accountId;
  if (!id) {
    const session = await auth();
    if (!session?.valid) {
      return null;
    }

    id = session.user!.accountId;
  }

  return prisma.user.findUnique({
    where: {
      id,
    },
  });
});

export type PublicUser = {
  id: string;
  userName: string;
  avatar: string | null;
  deleted: boolean;
};

export function toPublicUser(user: Pick<User, "id" | "userName" | "avatar" | "deleted">) {
  return user.deleted
    ? {
        id: "_",
        userName: "不明",
        avatar: null,
        deleted: true,
      }
    : {
        id: user.id,
        userName: user.userName,
        avatar: user.avatar,
        deleted: false,
      };
}
