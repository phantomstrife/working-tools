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

const sanitizeSlug = (value: string): string => {
   return (
      value
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-')
         .replace(/^-+|-+$/g, '') || 'lucky-draw'
   );
};

const formatDateTime = (iso: string | null): string => {
   if (!iso) {
      return '';
   }

   return new Date(iso).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
   });
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
               prize:lucky_draw_prizes!lucky_draw_winners_prize_id_fkey (
                  id,
                  name,
                  tier_order,
                  description
               ),
               attendant:lucky_draw_attendants!lucky_draw_winners_attendant_id_fkey (
                  id,
                  ticket_code,
                  citizen_id,
                  salutation,
                  full_name,
                  email,
                  phone,
                  company_name,
                  department,
                  sale_in_charge,
                  accommodation,
                  representative_salutation,
                  representative,
                  representative_phone
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
            header: 'Hạng giải',
            getValue: (row) => unwrapRelation(row.prize)?.tier_order ?? '',
         },
         {
            header: 'Tên giải thưởng',
            getValue: (row) => unwrapRelation(row.prize)?.name ?? '',
         },
         {
            header: 'Mô tả giải thưởng',
            getValue: (row) => unwrapRelation(row.prize)?.description ?? '',
         },
         {
            header: 'Mã vé',
            getValue: (row) => unwrapRelation(row.attendant)?.ticket_code ?? '',
         },
         {
            header: 'CCCD / CMND',
            getValue: (row) => unwrapRelation(row.attendant)?.citizen_id ?? '',
         },
         {
            header: 'Danh xưng',
            getValue: (row) => unwrapRelation(row.attendant)?.salutation ?? '',
         },
         {
            header: 'Họ và tên',
            getValue: (row) => unwrapRelation(row.attendant)?.full_name ?? '',
         },
         {
            header: 'Email',
            getValue: (row) => unwrapRelation(row.attendant)?.email ?? '',
         },
         {
            header: 'Số điện thoại',
            getValue: (row) => unwrapRelation(row.attendant)?.phone ?? '',
         },
         {
            header: 'Danh xưng người đại diện',
            getValue: (row) => unwrapRelation(row.attendant)?.representative_salutation ?? '',
         },
         {
            header: 'Người đại diện',
            getValue: (row) => unwrapRelation(row.attendant)?.representative ?? '',
         },
         {
            header: 'SĐT người đại diện',
            getValue: (row) => unwrapRelation(row.attendant)?.representative_phone ?? '',
         },
         {
            header: 'Công ty / Đơn vị',
            getValue: (row) => unwrapRelation(row.attendant)?.company_name ?? '',
         },
         {
            header: 'Phòng ban',
            getValue: (row) => unwrapRelation(row.attendant)?.department ?? '',
         },
         {
            header: 'Sale phụ trách',
            getValue: (row) => unwrapRelation(row.attendant)?.sale_in_charge ?? '',
         },
         {
            header: 'Lưu trú',
            getValue: (row) => (unwrapRelation(row.attendant)?.accommodation ? 'Có' : 'Không'),
         },
         {
            header: 'Thời gian trúng giải',
            getValue: (row) => formatDateTime(row.won_at),
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
