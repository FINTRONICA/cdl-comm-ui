const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['bcryptjs'],

  // Serve the whole app under `/commercial/*`
  // Example: `/escrow-account` → `/commercial/escrow-account`
  basePath: '/commercial',
  // IMPORTANT: do NOT set assetPrefix to `/commercial` when basePath is already `/commercial`
  // otherwise Next will generate `/commercial/commercial/_next/...` and assets will 404.
  assetPrefix: '',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Updated images configuration for Next.js 15
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
        pathname: '/**',
      },
    ],
  },

  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@mui/x-date-pickers',
  ],

  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
    ],
  },

  async redirects() {
    return [
      // Redirect root + non-basePath routes to the app mounted under `/commercial/*`
      // (basePath is disabled for these rules so they apply to incoming raw paths)
      {
        source: '/',
        destination: '/commercial',
        permanent: false,
        basePath: false,
      },
      {
        source: '/:path((?!commercial|products-hub|_next|next|api|favicon\\.ico).+)',
        destination: '/commercial/:path',
        permanent: false,
        basePath: false,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
