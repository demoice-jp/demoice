import { PolicyVote } from ".prisma/client";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/orm/client";
import ExpectedError from "@/lib/util/ExpectedError";

const VoteSchema = z.object({
  policyId: z.string().length(21),
  vote: z.enum(["positive", "negative"]).nullable(),
});

export type VoteSuccess = {
  policyId: string;
  votePositive: number;
  voteNegative: number;
  myVote: PolicyVote["vote"];
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let requestJson;
  try {
    requestJson = await request.json();
  } catch (e) {
    return Response.json(
      {
        message: "リクエスト形式が不正です",
      },
      {
        status: 400,
      },
    );
  }

  const parsedRequest = VoteSchema.safeParse({
    ...requestJson,
    policyId: params.id,
  });
  if (!parsedRequest.success) {
    return Response.json(
      {
        message: "リクエスト内容が不正です",
      },
      {
        status: 400,
      },
    );
  }

  const session = await auth();
  if (!session || !session.valid) {
    return Response.json(
      {
        message: "ログイン情報がありません",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const latestVote = await prisma.$transaction(async (prisma) => {
      const requestData = parsedRequest.data;
      const userId = session.user!.accountId;
      const policySelect = {
        id: true,
        votePositive: true,
        voteNegative: true,
      };

      const policy = await prisma.policy.findUnique({
        select: policySelect,
        where: {
          id: requestData.policyId,
        },
      });

      if (!policy) {
        throw new ExpectedError({
          status: 400,
          message: "政策が見つかりません",
        });
      }

      const voterId_policyId = {
        policyId: policy.id,
        voterId: userId,
      };

      const currentVote = await prisma.policyVote.findUnique({
        where: {
          voterId_policyId,
        },
      });

      if (!requestData.vote) {
        //投票の取り消し
        if (!currentVote) {
          return policy;
        } else {
          await prisma.policyVote.delete({
            where: {
              voterId_policyId,
            },
          });
          if (currentVote.vote === "positive") {
            // 賛成の取り消し
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                votePositive: {
                  decrement: 1,
                },
              },
            });
          } else if (currentVote.vote === "negative") {
            // 反対の取り消し
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                voteNegative: {
                  decrement: 1,
                },
              },
            });
          } else {
            throw new Error("定義されていない投票行動です");
          }
        }
      } else {
        // 投票
        await prisma.policyVote.upsert({
          where: {
            voterId_policyId,
          },
          update: {
            vote: requestData.vote,
          },
          create: {
            policyId: policy.id,
            voterId: userId,
            vote: requestData.vote,
          },
        });
        if (!currentVote) {
          // 新規投票
          if (requestData.vote === "positive") {
            // 賛成投票
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                votePositive: {
                  increment: 1,
                },
              },
            });
          } else if (requestData.vote === "negative") {
            // 反対投票
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                voteNegative: {
                  increment: 1,
                },
              },
            });
          } else {
            throw new Error("定義されていない投票行動です");
          }
        } else {
          // 投票変更
          if (currentVote.vote === requestData.vote) {
            return policy;
          }

          if (requestData.vote === "positive") {
            // 賛成へ変更
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                votePositive: {
                  increment: 1,
                },
                voteNegative: {
                  decrement: 1,
                },
              },
            });
          } else if (requestData.vote === "negative") {
            // 反対へ変更
            return prisma.policy.update({
              select: policySelect,
              where: {
                id: policy.id,
              },
              data: {
                votePositive: {
                  decrement: 1,
                },
                voteNegative: {
                  increment: 1,
                },
              },
            });
          } else {
            throw new Error("定義されていない投票行動です");
          }
        }
      }
    });

    return Response.json(
      {
        policyId: latestVote.id,
        votePositive: latestVote.votePositive,
        voteNegative: latestVote.voteNegative,
        myVote: parsedRequest.data.vote,
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    if (e instanceof ExpectedError) {
      return Response.json(
        {
          message: e.message,
        },
        {
          status: e.status,
        },
      );
    }
    console.error(e);
    return Response.json(
      {
        message: "投票の更新に失敗しました",
      },
      {
        status: 500,
      },
    );
  }
}
