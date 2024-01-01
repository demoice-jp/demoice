/* eslint-disable no-console */
import prisma from "@/lib/db/prisma";

const CHUNK_SIZE = 1000;
const TREND_SCORE_THRESHOLD = 15;

async function main() {
  console.log("トレンドスコアのDecrementを行います");

  let start = 0;
  while (true) {
    const policies = await prisma.policy.findMany({
      select: {
        id: true,
        trendScore: true,
      },
      orderBy: [
        {
          createdDate: "asc",
        },
        {
          id: "asc",
        },
      ],
      take: CHUNK_SIZE,
      skip: start,
    });

    for (const policy of policies) {
      if (policy.trendScore === 0) {
        continue;
      }
      await prisma.policy.update({
        select: {
          id: true,
        },
        where: {
          id: policy.id,
        },
        data: {
          trendScore: {
            decrement:
              policy.trendScore <= TREND_SCORE_THRESHOLD ? policy.trendScore : Math.ceil(policy.trendScore * 0.1),
          },
        },
      });
    }

    if (policies.length === 0) {
      break;
    }
    start += CHUNK_SIZE;
  }
}

main()
  .then(() => {
    console.log("トレンドスコアのDecrementが完了しました");
  })
  .catch((e) => {
    console.error(e);
    console.log("トレンドスコアのDecrementに失敗しました");
  });
