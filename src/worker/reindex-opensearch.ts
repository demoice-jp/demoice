/* eslint-disable no-console */
import dayjs from "dayjs";
import opensearch, { createPolicyIndex, setupPolicyIndex } from "@/lib/db/opensearch";
import prisma from "@/lib/db/prisma";

const CHUNK_SIZE = 1000;

async function reindexPolicies(index: string, skip: number) {
  const policies = await prisma.policy.findMany({
    include: {
      content: {
        select: {
          title: true,
          contentString: true,
          image: true,
        },
      },
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
    skip: skip,
  });

  if (policies.length === 0) {
    return 0;
  }

  await opensearch.bulk({
    body: policies
      .map((p) => [
        {
          index: {
            _index: index,
            _id: p.id,
          },
        },
        {
          title: p.content.title,
          contentString: p.content.contentString,
          image: p.content.image,
          created: p.createdDate.getTime(),
          votes: p.votePositive + p.voteNegative,
          trend: p.trendScore,
        },
      ])
      .flat(),
  });

  return policies.length;
}

async function main() {
  console.log("OpenSearchのReindexを行います");

  const currentIndex = await opensearch.indices
    .getAlias({
      name: "policy",
    })
    .then((res) => {
      const aliases = Object.keys(res.body);
      if (aliases.length !== 1) {
        throw new Error(`現在のAlias対象が1つではありません [${aliases.join(",")}]`);
      }
      return aliases[0];
    });
  console.log(`現在のIndexは"${currentIndex}"`);

  const newIndex = `policy-${dayjs().format("YYYYMMDDHHmm")}`;
  if (currentIndex === newIndex) {
    throw new Error("Reindex間隔が短すぎます");
  }

  await createPolicyIndex(newIndex);

  try {
    let currentPos = 0;
    while (true) {
      const count = await reindexPolicies(newIndex, currentPos);

      if (count === 0) {
        break;
      }
      currentPos += CHUNK_SIZE;
    }

    await setupPolicyIndex(newIndex);

    await opensearch.indices.updateAliases({
      body: {
        actions: [
          {
            remove: {
              index: currentIndex,
              alias: "policy",
            },
          },
          {
            add: {
              index: newIndex,
              alias: "policy",
            },
          },
        ],
      },
    });

    await opensearch.indices.delete({
      index: currentIndex,
    });

    // このAlias切り替えまでのわずかな間に新しいPolicyができているかもしれないのでもう一度インデクシング確認
    while (true) {
      const count = await reindexPolicies(newIndex, currentPos);

      if (count === 0) {
        break;
      }
      currentPos += CHUNK_SIZE;
    }
  } catch (e) {
    await opensearch.indices.delete({
      index: newIndex,
    });
    throw e;
  }
}

main()
  .then(() => {
    console.log("OpenSearchのReindexが完了しました");
  })
  .catch((e) => {
    console.error(e);
    console.log("OpenSearchのReindexに失敗しました");
  });
