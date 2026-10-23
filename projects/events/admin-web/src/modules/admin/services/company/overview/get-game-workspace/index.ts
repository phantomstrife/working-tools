'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getGameWorkspace: Types.GetGameWorkspace = async (request) => {
   if (!request.gameId?.trim()) {
      return { attendants: [], staff: [] };
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

   const [attendantsResult, staffResult] = await Promise.all([
      supabase
         .from('lucky_draw_attendants')
         .select('*')
         .eq('game_id', request.gameId)
         .order('created_at', { ascending: false }),
      supabase
         .from('game_accounts')
         .select('id, assigned_at, accounts!inner(id, full_name, email, phone, role, is_active)')
         .eq('game_id', request.gameId)
         .order('assigned_at', { ascending: false }),
   ]);

   if (attendantsResult.error) {
      throw new Error(attendantsResult.error.message);
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
      phone: row.accounts.phone,
      role: row.accounts.role,
      is_active: row.accounts.is_active,
   }));

   return {
      attendants: attendantsResult.data ?? [],
      staff,
   };
};

