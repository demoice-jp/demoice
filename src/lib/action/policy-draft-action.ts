"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import { ContentTitle, fillContent } from "@/lib/data/content";
import prisma from "@/lib/orm/client";

const MAX_DRAFT_COUNT = 10;

const DeleteSchema = z.object({
  id: z.string().uuid(),
});

const FillTitleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(60),
});

export type StartPolicyDraftState = {
  error?: string;
};

export type DeletePolicyDraftState = {
  policyDrafts: ContentTitle[];
  error?: {
    draftId: string;
    message: string;
  };
};

type FillPolicyDraftTitleState = {
  errors?: {
    title?: string[];
  };
  message?: string;
};

type FillPolicyDraftContentState = {
  message?: string;
};

function redirectToLogin(): never {
  redirect(
    `/auth/signin?${new URLSearchParams({
      callback: "/policy/create",
    })}`,
  );
}

function redirectToCreateMain(): never {
  redirect("/policy/create");
}

export async function startPolicyDraft(): Promise<StartPolicyDraftState> {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const draftCount = await prisma.content.count({
    where: {
      authorId: session.user!.accountId,
    },
  });

  if (draftCount >= MAX_DRAFT_COUNT) {
    return {
      error: "記載途中の投稿が多すぎます。先に記載途中のものを削除してください。",
    };
  }

  const newDraft = await prisma.content.create({
    data: {
      authorId: session.user!.accountId,
    },
  });

  redirect(`/policy/create/${newDraft.id}/step1`);
}

export async function deletePolicyDraft(prevState: DeletePolicyDraftState, formData: FormData) {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = DeleteSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      policyDrafts: [],
    };
  }

  let error: DeletePolicyDraftState["error"];
  try {
    await prisma.content.delete({
      select: {
        id: true,
      },
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
      },
    });
    revalidateTag("content");
  } catch (e) {
    console.error(e);
    error = {
      draftId: parsedInput.data.id,
      message: "削除に失敗しました。もう一度お試しください。",
    };
  }

  const policyDrafts = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
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

export async function fillPolicyDraftTitle(
  prevState: FillPolicyDraftTitleState,
  formData: FormData,
): Promise<FillPolicyDraftTitleState> {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = FillTitleSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    if (parsedInput.error.flatten().fieldErrors.id) {
      redirectToCreateMain();
    }

    return {
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.content.update({
      select: {
        id: true,
      },
      data: {
        title: parsedInput.data.title,
      },
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "概要の更新に失敗しました。もう一度試してください。",
    };
  }

  redirect(`/policy/create/${parsedInput.data.id}/step2`);
}

export async function fillPolicyDraftContent(
  prevState: FillPolicyDraftContentState,
  contentData: unknown,
): Promise<FillPolicyDraftContentState> {
  const result = await fillContent(contentData);
  if (!result.success) {
    switch (result.errorType) {
      case "NoLogin":
        redirectToLogin();
      case "InvalidId":
        redirectToCreateMain();
      case "ParseError":
        return {
          message: result.message,
        };
      default:
        throw new Error("fillContent時のエラーケースの実装漏れ");
    }
  }

  redirect(`/policy/create/${result.id}/step3`);
}
