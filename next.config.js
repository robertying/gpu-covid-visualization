const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
  },
  compress: false,
  output: "standalone",
};

module.exports = withBundleAnalyzer(nextConfig);
