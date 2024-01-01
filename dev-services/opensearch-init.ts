/* eslint-disable no-console */

import dayjs from "dayjs";
import opensearch, { createPolicyIndex, setupPolicyIndex } from "../src/lib/db/opensearch";

async function init() {
  const indexName = `policy-${dayjs().format("YYYYMMDDHHmm")}`;
  try {
    await createPolicyIndex(indexName);
    await setupPolicyIndex(indexName);
    console.log(`policyIndexが作成されました`);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    console.log(`policyIndexの作成に失敗しました`);
  }

  try {
    await opensearch.indices.putAlias({
      index: indexName,
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
