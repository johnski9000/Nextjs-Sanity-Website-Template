import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  env: {
    SC_DISABLE_SPEEDY: 'false',
  },

  images: {
    remotePatterns: [new URL('https://cdn.sanity.io/**')],
  },

  async redirects() {
    return [
      {
        source: '/homepage',
        destination: '/',
        permanent: true, // 301
      },
    ]
  },
}

export default nextConfig
