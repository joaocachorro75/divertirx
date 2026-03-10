/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações específicas se necessário
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

export default nextConfig
