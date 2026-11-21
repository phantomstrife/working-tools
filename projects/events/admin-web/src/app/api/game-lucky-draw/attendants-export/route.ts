import { NextResponse } from 'next/server';

import { useServicesGameLuckyDrawAttendantsExportCsv } from '@admin-web/services/game-lucky-draw/attendants-export-csv';
import { resolveErrorStatus } from '@admin-web/utilities/http';

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const gameId = searchParams.get('gameId') ?? '';

   if (!gameId) {
      return NextResponse.json(
         {
            error: true,
            message: 'Missing required query parameter: gameId.',
         },
         { status: 400 },
      );
   }

   const result = await useServicesGameLuckyDrawAttendantsExportCsv({ gameId });

   if (result.error) {
      return NextResponse.json(
         {
            error: true,
            message: result.message,
         },
         { status: resolveErrorStatus(result.message) },
      );
   }

   return new NextResponse(result.data.csvContent, {
      status: 200,
      headers: {
         'Content-Type': 'text/csv; charset=utf-8',
         'Content-Disposition': `attachment; filename="${result.data.fileName}"`,
         'Cache-Control': 'no-store',
         'X-Total-Count': String(result.data.totalCount),
         'X-Export-Filename': result.data.fileName,
      },
   });
}
