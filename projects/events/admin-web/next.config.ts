import type { NextConfig } from 'next';

import packageJson from './package.json';

const nextConfig: NextConfig = {
   allowedDevOrigins: ['192.168.1.2'],
   env: {
      NEXT_PUBLIC_APP_VERSION: packageJson.version,
      NEXT_PUBLIC_APP_BUILD_ID:
         process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
         process.env.NEXT_PUBLIC_APP_BUILD_ID ||
         '',
   },
   experimental: {
      serverActions: {
         bodySizeLimit: '5mb',
      },
   },
};

export default nextConfig;
