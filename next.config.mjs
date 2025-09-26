/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongodb'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
