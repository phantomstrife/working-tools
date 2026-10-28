'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export type Browser_Request = Omit<Types.Request, 'accessToken'>;
export type Browser_Service = (
   request: Browser_Request,
) => AdminWeb.Utilities.Trycatch.ResultAsync<Types.Response>;

interface Api_Envelope {
   data?: Types.Response;
   error?: boolean;
   message?: string;
}

export const useServicesGameLuckyDrawWinnerDrawBrowser: Browser_Service = async (request) => {
   const result = await trycatchAsync(async () => {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
         throw new Error('services.user.unauthenticated');
      }

      const response = await fetch('/api/game-lucky-draw/draw', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
         },
         body: JSON.stringify(request),
      });

      const payload = (await response.json()) as Api_Envelope;

      if (!response.ok || payload.error || !payload.data) {
         throw new Error(payload.message || 'services.game_lucky_draw.draw.failed');
      }

      return payload.data;
   });

   return result;
};

