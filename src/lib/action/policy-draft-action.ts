"use server";

import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import { ContentTitle, fillContent } from "@/lib/data/content";
import { deleteImages, deleteUnlinkImages, saveContentImage } from "@/lib/data/image";
import prisma from "@/lib/orm/client";

const MAX_DRAFT_COUNT = 10;

const DeleteSchema = z.object({
  id: z.string().length(21),
});

const FillTitleSchema = z.object({
  id: z.string().length(21),
  title: z.string().min(5).max(60),
});

const FillImageSchema = z.object({
  id: z.string().length(21),
  image: z.string().max(2_000_000).nullable(),
  size: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .nullish(),
});

const CommitSchema = z.object({
  id: z.string().length(21),
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

type FillPolicyDraftImageState = {
  message?: string;
};

type CommitPolicyDraftState = {
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
      id: nanoid(),
      authorId: session.user!.accountId,
    },
  });

  redirect(`/policy/create/${newDraft.id}/title`);
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
    const content = await prisma.content.findUnique({
      select: {
        id: true,
      },
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
        commitDate: null,
      },
    });

    if (!content) {
      redirectToCreateMain();
    }

    await deleteImages(parsedInput.data.id);

    await prisma.content.delete({
      select: {
        id: true,
      },
      where: {
        id: content.id,
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
      image: true,
    },
    where: {
      authorId: session.user!.accountId,
      commitDate: null,
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
        commitDate: null,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "概要の更新に失敗しました。もう一度試してください。",
    };
  }

  redirect(`/policy/create/${parsedInput.data.id}/content`);
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

  redirect(`/policy/create/${result.id}/image`);
}

export async function fillPolicyDraftImage(
  prevState: FillPolicyDraftImageState,
  imageData: unknown,
): Promise<FillPolicyDraftImageState> {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = FillImageSchema.safeParse(imageData);
  if (!parsedInput.success) {
    return {
      message: parsedInput.error.errors[0].message,
    };
  }

  if (!parsedInput.data.image) {
    redirect(`/policy/create/${parsedInput.data.id}/confirm`);
  }

  if (!parsedInput.data.size) {
    return {
      message: "画像サイズの指定がありません",
    };
  }

  const content = await prisma.content.findUnique({
    select: {
      id: true,
    },
    where: {
      id: parsedInput.data.id,
      authorId: session.user!.accountId,
      commitDate: null,
    },
  });

  if (!content) {
    return {
      message: "画像の添付先が見つかりません",
    };
  }

  const saveResult = await saveContentImage(content.id, parsedInput.data.image, ["jpg"]);
  if (!saveResult.success) {
    return {
      message: saveResult.message,
    };
  }

  try {
    await prisma.content.update({
      select: {
        id: true,
      },
      where: {
        id: content.id,
        authorId: session.user!.accountId,
        commitDate: null,
      },
      data: {
        image: {
          src: saveResult.location,
          width: parsedInput.data.size.width,
          height: parsedInput.data.size.height,
        },
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "画像メタデータの保存に失敗しました",
    };
  }

  redirect(`/policy/create/${parsedInput.data.id}/confirm`);
}

export async function commitPolicyDraft(
  prevState: CommitPolicyDraftState,
  formData: FormData,
): Promise<CommitPolicyDraftState> {
  const session = await auth();
  if (!session?.valid) {
    redirectToLogin();
  }

  const parsedInput = CommitSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      message: parsedInput.error.errors[0].message,
    };
  }

  try {
    const content = await prisma.content.findUnique({
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
        commitDate: null,
      },
    });
    if (!content || !content.title || !content.content || !content.contentHtml || !content.contentString) {
      return {
        message: "コンテンツが見つかりません",
      };
    }

    await deleteUnlinkImages(parsedInput.data.id, JSON.stringify({ content: content.content, image: content.image }));

    await prisma.content.update({
      select: {
        id: true,
      },
      where: {
        id: parsedInput.data.id,
        authorId: session.user!.accountId,
        commitDate: null,
      },
      data: {
        commitDate: new Date(),
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "投稿のコミットに失敗しました",
    };
  }

  return {};
}
