/* eslint-disable no-console */
import { Client } from "@opensearch-project/opensearch";

const node = process.env.OPENSEARCH_NODE_URLS;
if (!node) {
  throw Error("OPENSEARCH_NODE_URLS環境変数がありません");
}

const client = new Client({
  node: node.split(","),
});

async function init() {
  try {
    await client.indices.create({
      index: "policy-yyyymmddhhmm",
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
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
            updated: {
              type: "date",
            },
          },
        },
      },
    });
    console.log(`policyIndexが作成されました`);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    console.log(`policyIndexの作成に失敗しました`);
  }

  try {
    await client.indices.put_alias({
      index: "policy-yyyymmddhhmm",
      name: "policy",
    });
    console.log(`policyAliasが作成されました`);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    console.log(`policyAliasの作成に失敗しました`);
  }
}

init().finally(() => {
  console.log("OpenSearchの初期化を終了します");
});
