import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { getPageParam } from "@/lib/util/util";

const TAKE = 20;

export type MyCommentResponse = {
  values: {
    id: string;
    postedDate: string;
    content: string;
    policy: {
      id: string;
      content: {
        title: string;
      };
    };
  }[];
  isLast: boolean;
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.valid) {
    return Response.json(
      {
        success: false,
        message: "ログイン情報がありません",
      },
      {
        status: 401,
      },
    );
  }

  const accountId = session.user!.accountId;
  const skip = getPageParam(request) * TAKE;

  const comments = await prisma.comment.findMany({
    where: {
      authorId: accountId,
    },
    orderBy: {
      postedDate: "desc",
    },
    skip: skip,
    take: TAKE,
  });

  const policyComments = comments.filter((c) => c.parentType === "policy");
  const policies = await prisma.policy.findMany({
    select: {
      id: true,
      content: {
        select: {
          title: true,
        },
      },
    },
    where: {
      id: {
        in: policyComments.map((p) => p.parentId),
      },
    },
  });
  const resComments: MyCommentResponse["values"] = [];
  for (const comment of comments) {
    if (comment.parentType === "policy") {
      const policy = policies.find((p) => p.id === comment.parentId);
      if (policy) {
        resComments.push({
          id: comment.id,
          postedDate: comment.postedDate.toISOString(),
          content: comment.content,
          policy: {
            id: policy.id,
            content: {
              title: policy.content.title!,
            },
          },
        });
      }
    }
  }

  return Response.json(
    {
      values: resComments,
      isLast: comments.length < TAKE,
    },
    {
      status: 200,
    },
  );
}
