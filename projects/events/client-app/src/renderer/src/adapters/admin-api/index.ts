import { supabase } from '@client-app/adapters/supabase';

import { ADMIN_API } from './constants';

import type * as Types from './type';

// POST to [ADMIN_WEB] bearer-token APIs. Throws `Error(message)` so callers can wrap it in `trycatchAsync`.
export const requestAdminApi: Types.Request_Admin_Api = async <T>(request: Types.Request) => {
   const { path, body = {} } = request;

   const session = await supabase.auth.getSession();
   const accessToken = session.data.session?.access_token;

   if (!accessToken) {
      throw new Error('services.user.unauthenticated');
   }

   const response = await fetch(`${ADMIN_API.BASE_URL}${path}`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
   }).catch(() => null);

   if (!response) {
      throw new Error('services.admin_api.network_error');
   }

   const json = (await response.json().catch(() => null)) as Types.Response<T> | null;

   if (!json) {
      throw new Error('services.admin_api.invalid_response');
   }

   if (json.error) {
      throw new Error(json.message);
   }

   return json.data;
};
