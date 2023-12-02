"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import { PolicyDraftSummary } from "@/lib/data/policy-draft";
import prisma from "@/lib/orm/client";

const MAX_DRAFT_COUNT = 10;

const DeleteSchema = z.object({
  id: z.string(),
});

export type StartPolicyDraftState = {
  error?: string;
};

export type DeletePolicyDraftState = {
  policyDrafts: PolicyDraftSummary[];
  error?: {
    draftId: string;
    message: string;
  };
};

export async function startPolicyDraft(): Promise<StartPolicyDraftState> {
  const session = await auth();
  if (!session?.valid) {
    redirect(
      `/auth/signin?${new URLSearchParams({
        callback: "/policy/create/step0",
      })}`,
    );
  }

  const draftCount = await prisma.policyDraft.count({
    where: {
      authorId: session.user!.accountId,
    },
  });

  if (draftCount >= MAX_DRAFT_COUNT) {
    return {
      error: "記載途中の投稿が多すぎます。先に記載途中のものを削除してください。",
    };
  }

  const newDraft = await prisma.policyDraft.create({
    data: {
      authorId: session.user!.accountId,
    },
  });

  redirect(`/policy/create/${newDraft.id}/step1`);
}

export async function deletePolicyDraft(prevState: DeletePolicyDraftState, formData: FormData) {
  const session = await auth();
  if (!session?.valid) {
    redirect(
      `/auth/signin?${new URLSearchParams({
        callback: "/policy/create/step0",
      })}`,
    );
  }

  const parsedInput = DeleteSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      policyDrafts: [],
    };
  }

  let error: DeletePolicyDraftState["error"];
  try {
    await prisma.policyDraft.delete({
      select: {
        id: true,
      },
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
      },
    });
  } catch (e) {
    console.error(e);
    error = {
      draftId: parsedInput.data.id,
      message: "削除に失敗しました。もう一度お試しください。",
    };
  }

  const policyDrafts = await prisma.policyDraft.findMany({
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

  if (error) {
    return {
      policyDrafts,
      error,
    };
  } else {
    return {
      policyDrafts,
    };
  }
}
