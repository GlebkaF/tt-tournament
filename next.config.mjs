/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
