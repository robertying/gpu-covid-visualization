/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
  },
  output: "standalone",
  compress: false,
  experimental: {
    reactCompiler: true,
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
