import { NextResponse } from 'next/server';

import packageJson from '../../../../package.json';

export const dynamic = 'force-dynamic';

export async function GET() {
   const version = process.env.NEXT_PUBLIC_APP_VERSION || packageJson.version;
   const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || process.env.NEXT_PUBLIC_APP_BUILD_ID || '';

   return NextResponse.json(
      {
         version,
         buildId,
      },
      {
         headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
         },
      },
   );
}
