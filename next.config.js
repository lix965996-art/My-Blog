/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    scrollRestoration: false
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      use: [{ loader: '@svgr/webpack', options: { svgo: false } }]
    })
    return config
  },
  async redirects() {
    return [
      {
        source: '/zh',
        destination: '/',
        permanent: true
      },
      {
        source: '/en',
        destination: '/',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
