import { NextResponse } from 'next/server';

import { useServicesGameLuckyDrawAttendantSendEmails } from '@admin-web/services/game-lucky-draw/attendant-send-emails';

export async function POST(request: Request) {
   const body = (await request.json().catch(() => null)) as {
      gameId?: string;
      attendantIds?: string[];
   } | null;

   const gameId = body?.gameId ?? '';
   const attendantIds = Array.isArray(body?.attendantIds) ? body.attendantIds : [];

   if (!gameId || attendantIds.length === 0) {
      return NextResponse.json(
         {
            error: true,
            message: 'Missing required fields: gameId and non-empty attendantIds.',
         },
         { status: 400 },
      );
   }

   const result = await useServicesGameLuckyDrawAttendantSendEmails({
      gameId,
      attendantIds,
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

