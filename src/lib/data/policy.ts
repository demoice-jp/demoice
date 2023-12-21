import { cache } from "react";
import { Policy } from ".prisma/client";
import { Client } from "@opensearch-project/opensearch";
import { Content } from "@prisma/client";
import prisma from "@/lib/orm/client";

const node = process.env.OPENSEARCH_NODE_URLS;
if (!node) {
  throw Error("OPENSEARCH_NODE_URLS環境変数がありません");
}

const client = new Client({
  node: node.split(","),
});

export const getPolicyByContentId = cache(async (contentId: string) => {
  return prisma.policy.findUnique({
    where: {
      contentId,
    },
    include: {
      content: true,
    },
  });
});

export async function indexPolicy(policy: Policy & { content: Pick<Content, "title" | "image" | "contentString"> }) {
  await client.index({
    index: "policy",
    id: policy.id,
    body: {
      title: policy.content.title,
      contentString: policy.content.contentString,
      image: policy.content.image,
      created: policy.createdDate.getTime(),
      updated: policy.updatedDate.getTime(),
    },
  });
}
