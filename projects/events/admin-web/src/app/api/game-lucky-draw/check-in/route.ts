import { useServicesGameLuckyDrawAttendantCheckIn } from '@admin-web/services/game-lucky-draw/attendant-check-in';
import { corsJson, corsPreflight, readBearerToken, resolveErrorStatus } from '@admin-web/utilities/http';

export function OPTIONS() {
   return corsPreflight();
}

export async function POST(request: Request) {
   const body = (await request.json().catch(() => null)) as {
      gameId?: string;
      method?: AdminWeb.Database.Check_In_Method;
      qrCodePayload?: string;
      attendantId?: string;
      searchQuery?: string;
   } | null;

   const method = body?.method;

   if (!body?.gameId || (method !== 'QR_SCAN' && method !== 'MANUAL_SEARCH')) {
      return corsJson(
         {
            error: true,
            message: 'services.game_lucky_draw.check_in.missing_fields',
         },
         400,
      );
   }

   const result = await useServicesGameLuckyDrawAttendantCheckIn({
      accessToken: readBearerToken(request),
      gameId: body.gameId,
      method,
      qrCodePayload: body.qrCodePayload,
      attendantId: body.attendantId,
      searchQuery: body.searchQuery,
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

