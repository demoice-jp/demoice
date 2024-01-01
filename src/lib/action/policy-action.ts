"use server";

import { User } from "@prisma/client";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TREND_SCORE_COMMENT } from "@/const";
import { auth } from "@/lib/auth/auth";
import { PublicUser, toPublicUser } from "@/lib/data/user";
import prisma from "@/lib/db/prisma";
import ExpectedError from "@/lib/util/expected-error";

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
    const newComment = await prisma.$transaction(async (tx) => {
      const user = await tx.$queryRaw<Pick<User, "id" | "deleted">[]>`SELECT id, deleted FROM users WHERE id = ${
        session.user!.accountId
      } FOR UPDATE`;
      if (user.length !== 1 || user[0].deleted) {
        throw new ExpectedError({
          status: 403,
          message: "無効なユーザーです",
        });
      }

      const previousPost = await tx.comment.findFirst({
        select: { postedDate: true },
        where: {
          parentType: "policy",
          parentId: policy.id,
          authorId: session.user!.accountId,
        },
        orderBy: [
          {
            postedDate: "desc",
          },
        ],
      });

      const postedComment = await tx.comment.create({
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

      if (!previousPost || previousPost.postedDate < dayjs().add(-1, "day").toDate()) {
        await tx.policy.update({
          select: { id: true },
          where: {
            id: policy.id,
          },
          data: {
            trendScore: {
              increment: TREND_SCORE_COMMENT,
            },
          },
        });
      }

      return postedComment;
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
