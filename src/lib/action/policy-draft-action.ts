"use server";

import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import { PolicyDraftSummary } from "@/lib/data/policy-draft";
import prisma from "@/lib/orm/client";

const MAX_DRAFT_COUNT = 10;

const DeleteSchema = z.object({
  id: z.string().uuid(),
});

const FillSummarySchema = z.object({
  id: z.string().uuid(),
  summary: z.string().min(5).max(60),
});

const FillContentSchema = z.object({
  id: z.string().uuid(),
  content: z
    .string()
    .min(1, "本文を記載してください。")
    .max(1024 * 1024, "本文が長すぎます。")
    .refine((str) => {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    }, "本文の形式が不正です。"),
  contentHtml: z
    .string()
    .min(1, "本文を記載してください。")
    .max(1024 * 1024, "本文が長すぎます。"),
  contentString: z
    .string()
    .min(1, "本文を記載してください。")
    .max(1024 * 1024, "本文が長すぎます。"),
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

type FillPolicyDraftSummaryState = {
  errors?: {
    summary?: string[];
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

export async function fillPolicyDraftSummary(
  prevState: FillPolicyDraftSummaryState,
  formData: FormData,
): Promise<FillPolicyDraftSummaryState> {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = FillSummarySchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    if (parsedInput.error.flatten().fieldErrors.id) {
      redirectToCreateMain();
    }

    return {
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.policyDraft.update({
      select: {
        id: true,
      },
      data: {
        summary: parsedInput.data.summary,
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
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = FillContentSchema.safeParse(contentData);
  if (!parsedInput.success) {
    if (parsedInput.error.flatten().fieldErrors.id) {
      redirectToCreateMain();
    }

    return {
      message: parsedInput.error.errors[0].message,
    };
  }

  try {
    JSON.parse(parsedInput.data.content);
  } catch (e) {
    return {
      message: "本文の形式が不正です。",
    };
  }

  const jsdom = new JSDOM("");
  const domPurify = DOMPurify(jsdom.window);
  const pureContentHtml = domPurify.sanitize(parsedInput.data.contentHtml, {
    USE_PROFILES: { html: true },
  });

  await prisma.policyDraft.update({
    select: {
      id: true,
    },
    data: {
      content: parsedInput.data.content,
      contentHtml: pureContentHtml,
      contentString: parsedInput.data.contentString,
    },
    where: {
      id: parsedInput.data.id,
      authorId: session.user!.accountId,
    },
  });

  return {};
}
