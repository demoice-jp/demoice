import { cache } from "react";
import { Content } from "@prisma/client";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";

export type ContentTitle = Pick<Content, "id" | "title" | "authorId" | "contentString">;

export const getContentSummaries = cache(async (): Promise<ContentTitle[]> => {
  const session = await auth();
  if (!session?.valid) {
    return [];
  }

  return prisma.content.findMany({
    select: {
      id: true,
      title: true,
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

export const getContent = cache(async (id: string) => {
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

export type FillContentResult =
  | {
      success: true;
      id: string;
      updated: string;
    }
  | {
      success: false;
      errorType: "NoLogin" | "InvalidId";
    }
  | {
      success: false;
      errorType: "ParseError";
      message: string;
    };

export const fillContent = async (contentData: unknown): Promise<FillContentResult> => {
  const session = await auth();
  if (!session?.valid) {
    return {
      success: false,
      errorType: "NoLogin",
    };
  }

  const parsedInput = FillContentSchema.safeParse(contentData);
  if (!parsedInput.success) {
    if (parsedInput.error.flatten().fieldErrors.id) {
      return {
        success: false,
        errorType: "InvalidId",
      };
    }

    return {
      success: false,
      errorType: "ParseError",
      message: parsedInput.error.errors[0].message,
    };
  }

  try {
    JSON.parse(parsedInput.data.content);
  } catch (e) {
    return {
      success: false,
      errorType: "ParseError",
      message: "本文の形式が不正です。",
    };
  }

  const jsdom = new JSDOM("");
  const domPurify = DOMPurify(jsdom.window);
  const pureContentHtml = domPurify.sanitize(parsedInput.data.contentHtml, {
    USE_PROFILES: { html: true },
  });

  await prisma.content.update({
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

  return {
    success: true,
    id: parsedInput.data.id,
    updated: dayjs(new Date()).toISOString(),
  };
};
