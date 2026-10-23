'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getGameWorkspace: Types.GetGameWorkspace = async (request) => {
   if (!request.gameId?.trim()) {
      return { prizes: [], attendants: [], staff: [] };
   }

   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('Unauthorized.');
   }

   const profileResult = await supabase
      .from('accounts')
      .select('role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (profileResult.error || !profileResult.data) {
      throw new Error('Unable to verify caller permissions.');
   }

   const caller = profileResult.data;

   const gameResult = await supabase
      .from('games')
      .select('id, is_dev_only, events!inner(company_id)')
      .eq('id', request.gameId)
      .single();

   if (gameResult.error || !gameResult.data) {
      throw new Error('Target game not found.');
   }

   if (caller.role === 'ADMIN') {
      if (!caller.company_id || gameResult.data.events.company_id !== caller.company_id) {
         throw new Error('Access denied: Game does not belong to your company.');
      }
      if (gameResult.data.is_dev_only) {
         throw new Error('Access denied: Cannot access developer-only game.');
      }
   }

   const FETCH_BATCH_SIZE = 1000;

   async function fetchAllAttendants(gameId: string): Promise<Types.AttendantRow[]> {
      const allRows: Types.AttendantRow[] = [];
      let offset = 0;

      while (true) {
         const batchResult = await supabase
            .from('lucky_draw_attendants')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at', { ascending: false })
            .range(offset, offset + FETCH_BATCH_SIZE - 1);

         if (batchResult.error) {
            throw new Error(batchResult.error.message);
         }

         const rows = batchResult.data ?? [];
         allRows.push(...rows);

         if (rows.length < FETCH_BATCH_SIZE) {
            break;
         }

         offset += FETCH_BATCH_SIZE;
      }

      return allRows;
   }

   const [prizesResult, attendants, staffResult] = await Promise.all([
      supabase
         .from('lucky_draw_prizes')
         .select('*')
         .eq('game_id', request.gameId)
         .order('tier_order', { ascending: true }),
      fetchAllAttendants(request.gameId),
      supabase
         .from('game_accounts')
         .select('id, assigned_at, accounts!inner(id, full_name, email, username, phone, role, is_active)')
         .eq('game_id', request.gameId)
         .order('assigned_at', { ascending: false }),
   ]);

   if (prizesResult.error) {
      throw new Error(prizesResult.error.message);
   }

   if (staffResult.error) {
      throw new Error(staffResult.error.message);
   }

   const staff: Types.AssignedStaffMember[] = (staffResult.data ?? []).map((row) => ({
      assignmentId: row.id,
      assignedAt: row.assigned_at,
      id: row.accounts.id,
      full_name: row.accounts.full_name,
      email: row.accounts.email,
      username: row.accounts.username,
      phone: row.accounts.phone,
      role: row.accounts.role,
      is_active: row.accounts.is_active,
   }));

   return {
      prizes: prizesResult.data ?? [],
      attendants,
      staff,
   };
};
