import { NextResponse } from 'next/server';

import { useServicesGameLuckyDrawWinnersExportCsv } from '@admin-web/services/game-lucky-draw/winners-export-csv';

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

   const result = await useServicesGameLuckyDrawWinnersExportCsv({ gameId });

   if (result.error) {
      return NextResponse.json(
         {
            error: true,
            message: result.message,
         },
         { status: 400 },
      );
   }

   return new NextResponse(result.data.csvContent, {
      status: 200,
      headers: {
         'Content-Type': 'text/csv; charset=utf-8',
         'Content-Disposition': `attachment; filename="${result.data.fileName}"`,
      },
   });
}

