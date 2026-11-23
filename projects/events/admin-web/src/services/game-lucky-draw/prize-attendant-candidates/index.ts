'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const PAGE_SIZE = 1000;

const CANDIDATE_COLUMNS = [
   'id',
   'ticket_code',
   'salutation',
   'full_name',
   'representative_salutation',
   'representative',
   'company_name',
   'phone',
   'is_checked_in',
   'is_draw_eligible',
   'has_won',
].join(', ');

export const useServicesGameLuckyDrawPrizeAttendantCandidates: Types.Service = async (request) => {
   const { gameId } = request;

   return trycatchAsync(async () => {
      if (!gameId) {
         return {
            attendants: [],
         };
      }

      const allAttendants: Types.Candidate[] = [];
      let offset = 0;

      while (true) {
         const query = await supabase
            .from('lucky_draw_attendants')
            .select(CANDIDATE_COLUMNS)
            .eq('game_id', gameId)
            .order('ticket_code', { ascending: true })
            .order('id', { ascending: true })
            .range(offset, offset + PAGE_SIZE - 1)
            .returns<Types.Candidate[]>();

         if (query.error) {
            throw new Error(query.error.message);
         }

         const rows = query.data ?? [];
         allAttendants.push(...rows);

         if (rows.length < PAGE_SIZE) {
            break;
         }

         offset += PAGE_SIZE;
      }

      return {
         attendants: allAttendants,
      };
   });
};
