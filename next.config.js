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
  async redirects() {
    return [
      {
        source: "/",
        destination:
          "/adaptation-and-adoption-analyzing-gpu-trends-among-pc-gamers-during-covid-19-and-crypto-craze",
        permanent: false,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
