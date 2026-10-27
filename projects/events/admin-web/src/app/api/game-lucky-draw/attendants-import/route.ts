import { NextResponse } from 'next/server';

import { useServicesGameLuckyDrawAttendantImportCsv } from '@admin-web/services/game-lucky-draw/attendant-import-csv';

export async function POST(request: Request) {
   const contentType = request.headers.get('content-type') ?? '';
   let gameId = '';
   let csvContent = '';

   if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const rawGameId = formData.get('gameId');
      const file = formData.get('file');

      gameId = typeof rawGameId === 'string' ? rawGameId : '';

      if (file instanceof File) {
         csvContent = await file.text();
      }
   } else {
      const body = (await request.json().catch(() => null)) as { gameId?: string; csvContent?: string } | null;
      gameId = body?.gameId ?? '';
      csvContent = body?.csvContent ?? '';
   }

   if (!gameId || !csvContent) {
      return NextResponse.json(
         {
            error: true,
            message: 'Missing gameId or CSV file content.',
         },
         { status: 400 },
      );
   }

   const result = await useServicesGameLuckyDrawAttendantImportCsv({
      gameId,
      csvContent,
   });

   if (result.error) {
      return NextResponse.json(
         {
            error: true,
            message: result.message,
         },
         { status: 400 },
      );
   }

   return NextResponse.json({
      error: false,
      data: result.data,
   });
}

