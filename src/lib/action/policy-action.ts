"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { PublicUser, toPublicUser } from "@/lib/data/user";
import prisma from "@/lib/db/prisma";

export type Comment = {
  id: string;
  author: PublicUser;
  postedDate: string;
  content: string;
};

export type PostCommentState =
  | {
      success: null;
    }
  | {
      success: true;
      comment: Comment;
    }
  | {
      success: false;
      message: string;
    };

const PostCommentSchema = z.object({
  policyId: z.string().length(21),
  comment: z.string().trim().min(1).max(500),
});

export async function postComment(prevState: PostCommentState, formData: FormData): Promise<PostCommentState> {
  const parsedInput = PostCommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      success: false,
      message: "入力が不正です",
    };
  }

  const session = await auth();
  if (!session?.valid) {
    redirect("/auth/signin");
  }

  const policy = await prisma.policy.findUnique({
    select: {
      id: true,
    },
    where: {
      id: parsedInput.data.policyId,
    },
  });

  if (!policy) {
    return {
      success: false,
      message: "コメントする政策が見つかりません",
    };
  }

  const id = nanoid();
  try {
    const newComment = await prisma.comment.create({
      include: {
        author: {
          select: {
            id: true,
            userName: true,
            avatar: true,
            deleted: true,
          },
        },
      },
      data: {
        id,
        parentType: "policy",
        parentId: policy.id,
        authorId: session.user!.accountId,
        postedDate: new Date(),
        content: parsedInput.data.comment,
      },
    });

    return {
      success: true,
      comment: {
        id: newComment.id,
        author: toPublicUser(newComment.author),
        postedDate: newComment.postedDate.toISOString(),
        content: newComment.content,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "コメントの投稿に失敗しました",
    };
  }
}
