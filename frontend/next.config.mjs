import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.IMAGE_BUCKET_HOST,
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8001/api/v1/:path*',
      },
    ];
  },
  async headers() { // For CDN caching
    // TODO: Clean this up to be more graceful once it actually works
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60',
          },
          {
            key: 'Last-Modified',
            value: 'Sat, 12 Oct 2024 00:00:00 GMT'
          },
          {
            key: 'Transfer-Encoding',
            value: 'chunked'
          },
        ],
      },
    ]
  },
};

const sentryWebpackPluginOptions = {
  silent: true, // suppress Sentry errors during the build process
};

// wrap existing configuration with Sentry
const configWithSentry = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

export default withNextIntl(configWithSentry);
