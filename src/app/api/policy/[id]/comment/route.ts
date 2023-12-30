import { NextRequest } from "next/server";
import { Comment } from "@/lib/action/policy-action";
import { toPublicUser } from "@/lib/data/user";
import prisma from "@/lib/orm/client";

const TAKE = 5;

export type CommentResponse = {
  values: Comment[];
  isLast: boolean;
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const searchParams = request.nextUrl.searchParams;
  const requestedPage = searchParams.get("page");
  let skip = 0;
  try {
    if (requestedPage) {
      skip = Number.parseInt(requestedPage) * TAKE;
    }
  } catch (e) {}

  const comments = await prisma.comment.findMany({
    where: {
      parentType: "policy",
      parentId: params.id,
    },
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
    orderBy: [
      {
        parentType: "asc",
      },
      {
        parentId: "asc",
      },
      {
        postedDate: "desc",
      },
    ],
    skip: skip,
    take: TAKE,
  });

  const res: CommentResponse = {
    values: comments.map((c) => ({
      id: c.id,
      author: toPublicUser(c.author),
      postedDate: c.postedDate.toISOString(),
      content: c.content,
    })),
    isLast: comments.length < TAKE,
  };

  return Response.json(res, {
    status: 200,
  });
}
