import { useServicesGameLuckyDrawWinnerDraw } from '@admin-web/services/game-lucky-draw/winner-draw';
import { corsJson, corsPreflight, readBearerToken, resolveErrorStatus } from '@admin-web/utilities/http';

export function OPTIONS() {
   return corsPreflight();
}

export async function POST(request: Request) {
   const body = (await request.json().catch(() => null)) as {
      gameId?: string;
      prizeId?: string;
      revokeWinnerRecordId?: string;
      excludeAttendantIds?: string[];
   } | null;

   if (!body?.gameId || !body?.prizeId) {
      return corsJson(
         {
            error: true,
            message: 'services.game_lucky_draw.draw.missing_fields',
         },
         400,
      );
   }

   const result = await useServicesGameLuckyDrawWinnerDraw({
      accessToken: readBearerToken(request),
      gameId: body.gameId,
      prizeId: body.prizeId,
      revokeWinnerRecordId: body.revokeWinnerRecordId,
      excludeAttendantIds: Array.isArray(body.excludeAttendantIds) ? body.excludeAttendantIds : [],
   });

   if (result.error) {
      return corsJson(
         {
            error: true,
            message: result.message,
         },
         resolveErrorStatus(result.message),
      );
   }

   return corsJson({
      error: false,
      data: result.data,
   });
}

