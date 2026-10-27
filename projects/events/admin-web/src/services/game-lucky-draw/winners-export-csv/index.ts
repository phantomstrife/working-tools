'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { stringifyCsv } from '@admin-web/utilities/csv';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const unwrapRelation = <T>(relation: T | T[] | null | undefined): T | null => {
   if (!relation) {
      return null;
   }

   return Array.isArray(relation) ? (relation[0] ?? null) : relation;
};

const formatAccountAudit = (account: Types.JoinedAccount | null, fallbackId: string | null): string => {
   if (account) {
      return `${account.full_name} (${account.email})`;
   }

   return fallbackId ?? '';
};

const sanitizeSlug = (value: string): string => {
   return (
      value
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-')
         .replace(/^-+|-+$/g, '') || 'lucky-draw'
   );
};

export const useServicesGameLuckyDrawWinnersExportCsv: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase, userId, game, event } = access.data;
      const allWinners: Types.WinnerQueryRow[] = [];
      const pageSize = 1000;
      let offset = 0;

      while (true) {
         const winnersQuery = await supabase
            .from('lucky_draw_winners')
            .select(
               `
               id,
               won_at,
               drawn_by,
               prize:lucky_draw_prizes!lucky_draw_winners_prize_id_fkey (
                  id,
                  name,
                  tier_order,
                  description
               ),
               attendant:lucky_draw_attendants!lucky_draw_winners_attendant_id_fkey (
                  id,
                  ticket_code,
                  full_name,
                  email,
                  phone,
                  company_name,
                  department,
                  is_checked_in,
                  check_in_method,
                  checked_in_at,
                  checked_in_by,
                  checked_in_account:accounts!lucky_draw_attendants_checked_in_by_fkey (
                     id,
                     full_name,
                     email
                  )
               ),
               drawn_by_account:accounts!lucky_draw_winners_drawn_by_fkey (
                  id,
                  full_name,
                  email
               )
            `,
            )
            .eq('game_id', request.gameId)
            .order('won_at', { ascending: true })
            .range(offset, offset + pageSize - 1);

         if (winnersQuery.error) {
            throw new Error(winnersQuery.error.message);
         }

         const rows = (winnersQuery.data ?? []) as unknown as Types.WinnerQueryRow[];
         allWinners.push(...rows);

         if (rows.length < pageSize) {
            break;
         }

         offset += pageSize;
      }

      allWinners.sort((rowA, rowB) => {
         const prizeA = unwrapRelation(rowA.prize);
         const prizeB = unwrapRelation(rowB.prize);
         const tierDiff = (prizeA?.tier_order ?? 9999) - (prizeB?.tier_order ?? 9999);

         if (tierDiff !== 0) {
            return tierDiff;
         }

         return (rowA.won_at ?? '').localeCompare(rowB.won_at ?? '');
      });

      const csvContent = stringifyCsv(allWinners, [
         {
            header: 'prize_tier',
            getValue: (row) => unwrapRelation(row.prize)?.tier_order ?? '',
         },
         {
            header: 'prize_name',
            getValue: (row) => unwrapRelation(row.prize)?.name ?? '',
         },
         {
            header: 'prize_description',
            getValue: (row) => unwrapRelation(row.prize)?.description ?? '',
         },
         {
            header: 'ticket_code',
            getValue: (row) => unwrapRelation(row.attendant)?.ticket_code ?? '',
         },
         {
            header: 'full_name',
            getValue: (row) => unwrapRelation(row.attendant)?.full_name ?? '',
         },
         {
            header: 'email',
            getValue: (row) => unwrapRelation(row.attendant)?.email ?? '',
         },
         {
            header: 'phone',
            getValue: (row) => unwrapRelation(row.attendant)?.phone ?? '',
         },
         {
            header: 'company_name',
            getValue: (row) => unwrapRelation(row.attendant)?.company_name ?? '',
         },
         {
            header: 'department',
            getValue: (row) => unwrapRelation(row.attendant)?.department ?? '',
         },
         {
            header: 'won_at',
            getValue: (row) => row.won_at ?? '',
         },
         {
            header: 'drawn_by',
            getValue: (row) => formatAccountAudit(unwrapRelation(row.drawn_by_account), row.drawn_by),
         },
         {
            header: 'is_checked_in',
            getValue: (row) => (unwrapRelation(row.attendant)?.is_checked_in ? 'YES' : 'NO'),
         },
         {
            header: 'check_in_method',
            getValue: (row) => unwrapRelation(row.attendant)?.check_in_method ?? '',
         },
         {
            header: 'checked_in_at',
            getValue: (row) => unwrapRelation(row.attendant)?.checked_in_at ?? '',
         },
         {
            header: 'checked_in_by',
            getValue: (row) => {
               const attendant = unwrapRelation(row.attendant);
               return formatAccountAudit(
                  unwrapRelation(attendant?.checked_in_account),
                  attendant?.checked_in_by ?? null,
               );
            },
         },
      ]);

      await supabase.from('logs').insert({
         account_id: userId,
         event_id: event.id,
         game_id: game.id,
         action_type: 'REPORT_EXPORT',
         target_entity: 'lucky_draw_winners',
         metadata: {
            exported_count: allWinners.length,
         },
      });

      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `winners-${sanitizeSlug(game.name)}-${dateStamp}.csv`;

      return {
         csvContent,
         fileName,
         totalCount: allWinners.length,
      };
   });
};

