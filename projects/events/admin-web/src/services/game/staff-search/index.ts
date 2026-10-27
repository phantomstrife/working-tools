'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameStaffSearch: Types.Service = async (request) => {
   const { gameId, page = 1, pageSize = 10, search = '', filter = '' } = request;

   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;

      const queryResult = await supabase
         .from('game_accounts')
         .select(
            `
            id,
            account_id,
            assigned_at,
            account:accounts!game_accounts_account_id_fkey (
               id,
               full_name,
               email,
               phone,
               role,
               is_active
            )
         `,
         )
         .eq('game_id', gameId)
         .order('assigned_at', { ascending: false });

      if (queryResult.error) {
         throw new Error(queryResult.error.message);
      }

      const rawRows = (queryResult.data ?? []) as unknown as Types.GameAccountRow[];
      const normalizedSearch = search.trim().toLowerCase();

      const mapped: Types.StaffMember[] = [];

      rawRows.forEach((row) => {
         const account = Array.isArray(row.account) ? row.account[0] : row.account;
         if (!account) {
            return;
         }

         if (filter && account.role !== filter) {
            return;
         }

         if (normalizedSearch) {
            const haystack = [account.full_name, account.email, account.phone ?? ''].join(' ').toLowerCase();
            if (!haystack.includes(normalizedSearch)) {
               return;
            }
         }

         mapped.push({
            id: row.id,
            accountId: account.id,
            assigned_at: row.assigned_at,
            full_name: account.full_name,
            email: account.email,
            phone: account.phone,
            role: account.role,
            is_active: account.is_active ?? true,
         });
      });

      const from = (page - 1) * pageSize;
      const paginated = mapped.slice(from, from + pageSize);

      return {
         staff: paginated,
         totalCount: mapped.length,
      };
   });
};

