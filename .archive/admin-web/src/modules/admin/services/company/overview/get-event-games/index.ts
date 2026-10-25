'use server';

import { getServerClient } from '@/adapters/supabase/server';

import type * as Types from './type';

export const getEventGames: Types.GetEventGames = async (request) => {
   if (!request.eventId?.trim()) {
      return { games: [] };
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

   if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      const eventCheck = await supabase
         .from('events')
         .select('id, company_id')
         .eq('id', request.eventId)
         .single();

      if (eventCheck.error || !eventCheck.data || eventCheck.data.company_id !== caller.company_id) {
         throw new Error('Access denied: Event does not belong to your company.');
      }
   }

   let query = supabase
      .from('games')
      .select('*')
      .eq('event_id', request.eventId)
      .eq('is_dev_only', false)
      .order('created_at', { ascending: false });

   if (caller.role === 'SUPER_ADMIN') {
      query = supabase
         .from('games')
         .select('*')
         .eq('event_id', request.eventId)
         .eq('is_dev_only', false)
         .order('created_at', { ascending: false });
   }

   const result = await query;

   if (result.error) {
      throw new Error(result.error.message);
   }

   return {
      games: result.data ?? [],
   };
};

