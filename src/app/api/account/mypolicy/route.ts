import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { getPageParam } from "@/lib/util/util";

const TAKE = 20;

export type MyPolicyResponse = {
  values: {
    id: string;
    title: string;
    commitDate: string;
    policyVersion: {
      isLatest: boolean;
      policy: {
        id: string;
        votePositive: number;
        voteNegative: number;
      };
    };
  }[];
  isLast: boolean;
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.valid) {
    return {
      success: false,
      message: "ログイン情報がありません",
    };
  }
  const accountId = session.user!.accountId;
  const skip = getPageParam(request) * TAKE;

  const contents = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      commitDate: true,
      policyVersion: {
        select: {
          policy: {
            select: {
              id: true,
              votePositive: true,
              voteNegative: true,
              contentId: true,
            },
          },
        },
      },
    },
    where: {
      authorId: accountId,
      commitDate: {
        not: null,
      },
    },
    orderBy: {
      commitDate: "desc",
    },
    skip: skip,
    take: TAKE,
  });

  const res: MyPolicyResponse = {
    values: contents
      .filter((content) => content.policyVersion)
      .map((content) => {
        const policyVersion = content.policyVersion!;
        const policy = policyVersion.policy;
        return {
          id: content.id,
          title: content.title!,
          commitDate: content.commitDate!.toISOString(),
          policyVersion: {
            isLatest: content.id === content.policyVersion!.policy.contentId,
            policy: {
              id: policy.id,
              votePositive: policy.votePositive,
              voteNegative: policy.voteNegative,
            },
          },
        };
      }),
    isLast: contents.length < TAKE,
  };

  return Response.json(res, {
    status: 200,
  });
}
