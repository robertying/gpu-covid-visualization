import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
  },
  output: "standalone",
  compress: false,
  reactCompiler: true,
  experimental: {
    // The project's aliased `typescript` package (`@typescript/typescript6`)
    // only ships the compiler API (`lib/typescript.js`), not a `tsc` binary,
    // so it can't satisfy Next's CLI-based type checker (default since 16.3).
    useTypeScriptCli: false,
  },
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

export default nextConfig;
