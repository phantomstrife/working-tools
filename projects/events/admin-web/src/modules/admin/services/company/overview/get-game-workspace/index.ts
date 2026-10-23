'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

async function verifyGameAccess(gameId: string) {
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
      .eq('id', gameId)
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

   return supabase;
}

export const getGameWorkspace: Types.GetGameWorkspace = async (request) => {
   if (!request.gameId?.trim()) {
      return { prizes: [], staff: [] };
   }

   const supabase = await verifyGameAccess(request.gameId);

   const [prizesResult, staffResult] = await Promise.all([
      supabase
         .from('lucky_draw_prizes')
         .select('*')
         .eq('game_id', request.gameId)
         .order('tier_order', { ascending: true }),
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
      staff,
   };
};

export const getPaginatedAttendants: Types.GetPaginatedAttendants = async (
   gameId,
   page,
   pageSize,
   options,
) => {
   if (!gameId?.trim()) {
      return {
         attendants: [],
         totalCount: 0,
         totalPages: 1,
      };
   }

   const supabase = await verifyGameAccess(gameId);

   const safePage = Math.max(1, page);
   const safePageSize = Math.max(1, pageSize);
   const from = (safePage - 1) * safePageSize;
   const to = from + safePageSize - 1;

   let query = supabase
      .from('lucky_draw_attendants')
      .select('*', { count: 'exact' })
      .eq('game_id', gameId);

   const trimmedSearch = options?.search?.trim();
   if (trimmedSearch) {
      query = query.or(
         `full_name.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%,ticket_code.ilike.%${trimmedSearch}%`,
      );
   }

   switch (options?.filter) {
      case 'CHECKED_IN':
         query = query.eq('is_checked_in', true);
         break;
      case 'NOT_CHECKED_IN':
         query = query.eq('is_checked_in', false);
         break;
      case 'WINNER':
         query = query.eq('has_won', true);
         break;
      case 'NOT_WINNER':
         query = query.eq('has_won', false);
         break;
      case 'EMAIL_SENT':
         query = query.eq('email_status', 'SENT');
         break;
      case 'EMAIL_NOT_SENT':
         query = query.eq('email_status', 'NOT_SENT');
         break;
      case 'EMAIL_FAILED':
         query = query.eq('email_status', 'FAILED');
         break;
      default:
         break;
   }

   const result = await query.order('created_at', { ascending: false }).range(from, to);

   if (result.error) {
      throw new Error(result.error.message);
   }

   const totalCount = result.count ?? 0;
   const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));

   return {
      attendants: result.data ?? [],
      totalCount,
      totalPages,
   };
};
