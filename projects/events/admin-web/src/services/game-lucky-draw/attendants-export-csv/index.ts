'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { stringifyCsv } from '@admin-web/utilities/csv';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const PAGE_SIZE = 1000;

const ATTENDANT_EXPORT_COLUMNS = [
   'id',
   'ticket_code',
   'full_name',
   'email',
   'phone',
   'citizen_id',
   'company_name',
   'department',
   'sale_in_charge',
   'accommodation',
   'representative',
   'representative_phone',
   'email_status',
   'email_sent_at',
   'is_checked_in',
   'checked_in_at',
   'check_in_method',
   'has_won',
   'created_at',
].join(', ');

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

const getEffectiveRepresentative = (row: Types.AttendantExportRow): string => {
   const rawRepresentative = (row.representative ?? '').trim();
   return rawRepresentative || (row.full_name ?? '').trim();
};

const getEffectiveRepresentativePhone = (row: Types.AttendantExportRow): string => {
   const rawRepPhone = (row.representative_phone ?? '').trim();
   return rawRepPhone || (row.phone ?? '').trim();
};

export const useServicesGameLuckyDrawAttendantsExportCsv: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase, userId, game, event } = access.data;
      const allAttendants: Types.AttendantExportRow[] = [];
      let offset = 0;

      while (true) {
         const attendantsQuery = await supabase
            .from('lucky_draw_attendants')
            .select(ATTENDANT_EXPORT_COLUMNS)
            .eq('game_id', request.gameId)
            .order('ticket_code', { ascending: true })
            .order('created_at', { ascending: true })
            .range(offset, offset + PAGE_SIZE - 1)
            .returns<Types.AttendantExportRow[]>();

         if (attendantsQuery.error) {
            throw new Error(attendantsQuery.error.message);
         }

         const rows = attendantsQuery.data ?? [];
         allAttendants.push(...rows);

         if (rows.length < PAGE_SIZE) {
            break;
         }

         offset += PAGE_SIZE;
      }

      const csvContent = stringifyCsv(allAttendants, [
         {
            header: 'ticket_code',
            getValue: (row) => row.ticket_code ?? '',
         },
         {
            header: 'full_name',
            getValue: (row) => row.full_name ?? '',
         },
         {
            header: 'email',
            getValue: (row) => row.email ?? '',
         },
         {
            header: 'phone',
            getValue: (row) => row.phone ?? '',
         },
         {
            header: 'citizen_id',
            getValue: (row) => row.citizen_id ?? '',
         },
         {
            header: 'company_name',
            getValue: (row) => row.company_name ?? '',
         },
         {
            header: 'department',
            getValue: (row) => row.department ?? '',
         },
         {
            header: 'sale_in_charge',
            getValue: (row) => row.sale_in_charge ?? '',
         },
         {
            header: 'accommodation',
            getValue: (row) => (row.accommodation ? 'true' : 'false'),
         },
         {
            header: 'representative',
            getValue: (row) => getEffectiveRepresentative(row),
         },
         {
            header: 'representative_phone',
            getValue: (row) => getEffectiveRepresentativePhone(row),
         },
         {
            header: 'email_status',
            getValue: (row) => row.email_status ?? 'NOT_SENT',
         },
         {
            header: 'email_sent_at',
            getValue: (row) => formatDateTime(row.email_sent_at),
         },
         {
            header: 'is_checked_in',
            getValue: (row) => (row.is_checked_in ? 'true' : 'false'),
         },
         {
            header: 'checked_in_at',
            getValue: (row) => formatDateTime(row.checked_in_at),
         },
         {
            header: 'check_in_method',
            getValue: (row) => row.check_in_method ?? '',
         },
         {
            header: 'has_won',
            getValue: (row) => (row.has_won ? 'true' : 'false'),
         },
         {
            header: 'created_at',
            getValue: (row) => formatDateTime(row.created_at),
         },
      ]);

      await supabase.from('logs').insert({
         account_id: userId,
         event_id: event.id,
         game_id: game.id,
         action_type: 'REPORT_EXPORT',
         target_entity: 'lucky_draw_attendants',
         metadata: {
            exported_count: allAttendants.length,
         },
      });

      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `attendants-${sanitizeSlug(game.name)}-${dateStamp}.csv`;

      return {
         csvContent,
         fileName,
         totalCount: allAttendants.length,
      };
   });
};
