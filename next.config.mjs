/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  env: {
    NVIDIA_BASE_URL: process.env.NVIDIA_BASE_URL,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    ONPIX_PROXY: process.env.ONPIX_PROXY,
    ONPIX_USERNAME: process.env.ONPIX_USERNAME,
    ONPIX_PASSWORD: process.env.ONPIX_PASSWORD,
  },
};

export default nextConfig;
