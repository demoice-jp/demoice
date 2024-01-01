import { cache } from "react";
import { Policy } from ".prisma/client";
import { Content } from "@prisma/client";
import opensearch from "@/lib/db/opensearch";
import prisma from "@/lib/db/prisma";

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

export const getPolicyById = cache(async (policyId: string) => {
  return prisma.policy.findUnique({
    where: {
      id: policyId,
    },
    include: {
      content: true,
    },
  });
});

export async function indexPolicy(policy: Policy & { content: Pick<Content, "title" | "image" | "contentString"> }) {
  await opensearch.index({
    index: "policy",
    id: policy.id,
    body: {
      title: policy.content.title,
      contentString: policy.content.contentString,
      image: policy.content.image,
      created: policy.createdDate.getTime(),
      votes: policy.votePositive + policy.voteNegative,
      trend: policy.trendScore,
    },
  });
}

export type SearchPolicyProp = {
  query: string;
  from?: number;
  size?: number;
  sort: "created" | "votes" | "trend" | "score";
};

export type PolicySummary = {
  id: string;
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

export async function searchPolicy({ query, from, size, sort }: SearchPolicyProp) {
  const order: Partial<{ [key in "trend" | "created" | "votes" | "_score"]: { order: "asc" | "desc" } }>[] = [];
  if (sort === "created") {
  } else if (sort === "votes") {
    order.push({
      votes: { order: "desc" },
    });
  } else if (sort === "score") {
    order.push({
      _score: { order: "desc" },
    });
    order.push({
      votes: { order: "desc" },
    });
  } else {
    // トレンド順
    order.push({
      trend: { order: "desc" },
    });
    order.push({
      votes: { order: "desc" },
    });
  }
  order.push({
    created: { order: "desc" },
  });

  const searchResponse = await opensearch.search({
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
      sort: order,
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
    isLast: (from || 0) + docHits.length >= total,
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
