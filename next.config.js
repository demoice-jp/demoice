/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer && config.name === "server") {
      const oldEntry = config.entry;
      return {
        ...config,
        async entry(...args) {
          const entries = await oldEntry(...args);
          return {
            ...entries,
            reindexOpensearch: path.resolve(process.cwd(), "src/worker/reindex-opensearch.ts"),
            decrementTrendScore: path.resolve(process.cwd(), "src/worker/decrement-trend-score.ts"),
          };
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
