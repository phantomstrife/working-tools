'use client';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { PARTICIPANT_COLUMNS, PRIZE_COLUMNS, WINNER_COLUMNS } from './constants';

import type * as Types from './type';

const isAbsentForfeited = (metadata: unknown): boolean => {
   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      return false;
   }

   return Boolean((metadata as Record<string, unknown>).is_absent_forfeited);
};

export const useServicesGameLuckyDrawStateRead: Types.Service = async (request) => {
   const { gameId } = request;

   const result = await trycatchAsync(async () => {
      const [prizesQuery, participantsQuery, winnersQuery] = await Promise.all([
         supabase
            .from('lucky_draw_prizes')
            .select(PRIZE_COLUMNS)
            .eq('game_id', gameId)
            .order('tier_order', { ascending: true })
            .order('created_at', { ascending: true })
            .returns<Types.Prize_Row[]>(),
         supabase
            .from('lucky_draw_attendants')
            .select(PARTICIPANT_COLUMNS)
            .eq('game_id', gameId)
            .eq('is_checked_in', true)
            .order('checked_in_at', { ascending: true })
            .returns<Types.Participant_Row[]>(),
         supabase
            .from('lucky_draw_winners')
            .select(WINNER_COLUMNS)
            .eq('game_id', gameId)
            .order('won_at', { ascending: true })
            .returns<Types.Winner_Row[]>(),
      ]);

      if (prizesQuery.error) {
         throw new Error(prizesQuery.error.message);
      }

      if (participantsQuery.error) {
         throw new Error(participantsQuery.error.message);
      }

      if (winnersQuery.error) {
         throw new Error(winnersQuery.error.message);
      }

      const prizes: Types.Prize[] = (prizesQuery.data ?? []).map((row) => ({
         id: row.id,
         name: row.name,
         description: row.description,
         imageUrl: row.image_url ?? '',
         tierOrder: row.tier_order,
         totalQuantity: row.total_quantity,
         remainingQuantity: row.remaining_quantity,
      }));

      const participants: Types.Participant[] = (participantsQuery.data ?? []).map((row) => ({
         id: row.id,
         ticketCode: row.ticket_code,
         name: row.full_name,
         companyName: row.company_name,
         department: row.department,
         hasWon: Boolean(row.has_won),
         isAbsentForfeited: isAbsentForfeited(row.custom_metadata),
      }));

      const winners: Types.Winner_Entry[] = (winnersQuery.data ?? []).flatMap((row) => {
         const attendant = Array.isArray(row.attendant) ? row.attendant[0] : row.attendant;

         if (!attendant) {
            return [];
         }

         return [
            {
               id: row.id,
               prizeId: row.prize_id,
               attendantId: row.attendant_id,
               ticketCode: attendant.ticket_code,
               name: attendant.full_name,
               companyName: attendant.company_name,
               department: attendant.department,
               wonAt: row.won_at,
            },
         ];
      });

      return {
         prizes,
         participants,
         winners,
      };
   });

   return result;
};

