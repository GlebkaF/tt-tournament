const isStandalone = process.env.BUILD_STANDALONE === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStandalone ? "standalone" : undefined,
  experimental: isStandalone ? { cpus: 1, workerThreads: false } : undefined,
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
