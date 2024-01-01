import { Client } from "@opensearch-project/opensearch";

const node = process.env.OPENSEARCH_NODE_URLS;
if (!node) {
  throw Error("OPENSEARCH_NODE_URLS環境変数がありません");
}

const policyShards = Number(process.env.OPENSEARCH_POLICY_SHARDS);
if (!process.env.OPENSEARCH_POLICY_SHARDS || !Number.isInteger(policyShards) || policyShards < 1) {
  throw Error("OPENSEARCH_POLICY_SHARDS環境変数が不正です");
}

const policyReplicas = Number(process.env.OPENSEARCH_POLICY_REPLICAS);
if (!process.env.OPENSEARCH_POLICY_REPLICAS || !Number.isInteger(policyReplicas) || policyReplicas < 0) {
  throw Error("OPENSEARCH_POLICY_REPLICAS環境変数が不正です");
}

const opensearch = new Client({
  node: node.split(","),
});

export async function createPolicyIndex(indexName: string) {
  return opensearch.indices.create({
    index: indexName,
    body: {
      settings: {
        number_of_shards: policyShards,
        number_of_replicas: 0,
        refresh_interval: "-1",
        "translog.durability": "async",
        analysis: {
          analyzer: {
            sudachi_custom_analyzer: {
              type: "custom",
              tokenizer: "sudachi_c_tokenizer",
              filter: ["sudachi_split", "sudachi_normalizedform", "sudachi_part_of_speech", "sudachi_ja_stop"],
            },
          },
          tokenizer: {
            sudachi_c_tokenizer: {
              type: "sudachi_tokenizer",
              split_mode: "C",
              discard_punctuation: true,
            },
          },
        },
      },
      mappings: {
        dynamic: "strict",
        properties: {
          title: {
            type: "text",
            analyzer: "sudachi_custom_analyzer",
          },
          contentString: {
            type: "text",
            analyzer: "sudachi_custom_analyzer",
          },
          image: {
            type: "object",
            enabled: false,
          },
          created: {
            type: "date",
          },
          votes: {
            type: "integer",
          },
          trend: {
            type: "integer",
          },
        },
      },
    },
  });
}

export async function setupPolicyIndex(indexName: string) {
  return opensearch.indices.putSettings({
    index: indexName,
    body: {
      number_of_replicas: policyReplicas,
      refresh_interval: null,
      "translog.durability": null,
    },
  });
}

export default opensearch;
