'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

export const useServicesGameStaffSave: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase, companyId, event } = access.data;

      if (request.mode === 'assign') {
         const accountCheck = await supabase
            .from('accounts')
            .select('id, company_id, role')
            .eq('id', request.accountId)
            .single();

         if (accountCheck.error || !accountCheck.data || accountCheck.data.company_id !== companyId) {
            throw new Error('services.account.not_found');
         }

         const existingAssignment = await supabase
            .from('game_accounts')
            .select('id')
            .eq('game_id', request.gameId)
            .eq('account_id', request.accountId)
            .maybeSingle();

         if (existingAssignment.error) {
            throw new Error(existingAssignment.error.message);
         }

         if (existingAssignment.data) {
            throw new Error('services.game.staff_already_assigned');
         }

         const inserted = await supabase
            .from('game_accounts')
            .insert({
               game_id: request.gameId,
               event_id: event.id,
               account_id: request.accountId,
            })
            .select('id')
            .single();

         if (inserted.error || !inserted.data) {
            throw new Error(inserted.error?.message || 'services.game.staff_assign_failed');
         }

         return {
            assignmentId: inserted.data.id,
         };
      }

      const assignmentCheck = await supabase
         .from('game_accounts')
         .select('id, account_id')
         .eq('id', request.assignmentId)
         .eq('game_id', request.gameId)
         .single();

      if (assignmentCheck.error || !assignmentCheck.data || assignmentCheck.data.account_id !== request.accountId) {
         throw new Error('services.game.get_staff_not_found');
      }

      const trimmedFullName = request.full_name.trim();
      if (!trimmedFullName) {
         throw new Error('services.game.staff_missing_name');
      }

      const updatedAccount = await supabase
         .from('accounts')
         .update({
            full_name: trimmedFullName,
            phone: request.phone?.trim() || null,
            role: request.role,
            is_active: request.is_active,
            updated_at: new Date().toISOString(),
         })
         .eq('id', request.accountId)
         .eq('company_id', companyId)
         .in('role', ['FIELD_STAFF', 'GUARD'])
         .select('id')
         .single();

      if (updatedAccount.error || !updatedAccount.data) {
         throw new Error(updatedAccount.error?.message || 'services.game.staff_update_failed');
      }

      return {
         assignmentId: request.assignmentId,
      };
   });
};

