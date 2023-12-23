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

type SearchPolicyProp = {
  query: string;
  from?: number;
  size?: number;
};

type PolicyHit = {
  _id: string;
  _source: {
    title: string;
    contentString: string;
    image: null | {
      src: string;
      size: {
        width: number;
        height: number;
      };
    };
  };
};

export async function searchPolicy({ query, from, size }: SearchPolicyProp) {
  const searchResponse = await client.search({
    index: "policy",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["title^3", "contentString"],
          tie_breaker: 0.5,
          zero_terms_query: "all",
        },
      },
      from: from || 0,
      size: size || 10,
    },
  });

  const hits = searchResponse.body.hits;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const total: number = hits.total.value;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const docHits: PolicyHit[] = hits.hits;
  return {
    total,
    isLast: (from || 0) + docHits.length < total,
    policies: docHits.map((doc) => {
      return {
        id: doc._id,
        title: doc._source.title,
        contentString: doc._source.contentString,
        image: doc._source.image,
      };
    }),
  };
}
