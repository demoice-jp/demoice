import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { getPageParam } from "@/lib/util/util";

const TAKE = 20;

export type MyVoteResponse = {
  values: {
    vote: string;
    votedDate: string;
    policy: {
      id: string;
      votePositive: number;
      voteNegative: number;
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

  const votes = await prisma.policyVote.findMany({
    include: {
      policy: {
        include: {
          content: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    where: {
      voterId: accountId,
    },
    orderBy: {
      votedDate: "desc",
    },
    skip: skip,
    take: TAKE,
  });

  const res: MyVoteResponse = {
    values: votes.map((v) => ({
      vote: String(v.vote),
      votedDate: v.votedDate.toISOString(),
      policy: {
        id: v.policyId,
        votePositive: v.policy.votePositive,
        voteNegative: v.policy.voteNegative,
        content: {
          title: v.policy.content.title!,
        },
      },
    })),
    isLast: votes.length < TAKE,
  };

  return Response.json(res, {
    status: 200,
  });
}
