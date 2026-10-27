'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameStaffCandidates: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase, companyId } = access.data;

      const [assignedResult, accountsResult] = await Promise.all([
         supabase.from('game_accounts').select('account_id').eq('game_id', request.gameId),
         supabase
            .from('accounts')
            .select('id, full_name, email, phone, role, is_active')
            .eq('company_id', companyId)
            .in('role', ['FIELD_STAFF', 'GUARD'])
            .order('full_name', { ascending: true }),
      ]);

      if (assignedResult.error) {
         throw new Error(assignedResult.error.message);
      }

      if (accountsResult.error) {
         throw new Error(accountsResult.error.message);
      }

      const assignedIds = new Set((assignedResult.data ?? []).map((item) => item.account_id));

      const candidates: Types.CandidateAccount[] = (accountsResult.data ?? [])
         .filter((account) => !assignedIds.has(account.id))
         .map((account) => ({
            id: account.id,
            full_name: account.full_name,
            email: account.email,
            phone: account.phone,
            role: account.role,
            is_active: account.is_active ?? true,
         }));

      return {
         candidates,
      };
   });
};

