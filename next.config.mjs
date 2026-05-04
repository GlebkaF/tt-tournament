/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  async redirects() {
    return [
      {
        source: "/standings",
        destination: "/tournament/1",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
