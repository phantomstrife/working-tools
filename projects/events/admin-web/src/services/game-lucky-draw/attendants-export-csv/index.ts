'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { stringifyCsv } from '@admin-web/utilities/csv';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const PAGE_SIZE = 1000;

const ATTENDANT_EXPORT_COLUMNS = [
   'id',
   'ticket_code',
   'salutation',
   'full_name',
   'email',
   'phone',
   'citizen_id',
   'representative_salutation',
   'representative',
   'representative_phone',
   'company_name',
   'department',
   'sale_in_charge',
   'accommodation',
   'email_status',
   'email_sent_at',
   'is_checked_in',
   'checked_in_at',
   'check_in_method',
   'is_draw_eligible',
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

const EMAIL_STATUS_LABELS: Record<AdminWeb.Database.Email_Status, string> = {
   NOT_SENT: 'Chưa gửi',
   SENDING: 'Đang gửi',
   SENT: 'Đã gửi',
   FAILED: 'Thất bại',
};

const CHECK_IN_METHOD_LABELS: Record<AdminWeb.Database.Check_In_Method, string> = {
   QR_SCAN: 'Quét mã QR',
   MANUAL_SEARCH: 'Tra cứu thủ công',
};

const formatDateTime = (iso: string | null): string => {
   if (!iso) {
      return '';
   }

   return new Date(iso).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
   });
};

const formatEmailStatus = (status: AdminWeb.Database.Email_Status | null): string => {
   return EMAIL_STATUS_LABELS[status ?? 'NOT_SENT'] ?? 'Chưa gửi';
};

const formatCheckInMethod = (method: AdminWeb.Database.Check_In_Method | null): string => {
   if (!method) {
      return '';
   }

   return CHECK_IN_METHOD_LABELS[method] ?? method;
};

const getEffectiveRepresentative = (row: Types.AttendantExportRow): string => {
   const rawRepName = (row.representative ?? '').trim();
   return rawRepName || (row.full_name ?? '').trim();
};

const getEffectiveRepresentativeSalutation = (row: Types.AttendantExportRow): string => {
   const rawRepName = (row.representative ?? '').trim();
   const rawRepSalutation = (row.representative_salutation ?? '').trim();
   const rawGuestSalutation = (row.salutation ?? '').trim();

   return rawRepName ? rawRepSalutation : rawRepSalutation || rawGuestSalutation;
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
            header: 'Mã vé',
            getValue: (row) => row.ticket_code ?? '',
         },
         {
            header: 'Danh xưng',
            getValue: (row) => row.salutation ?? '',
         },
         {
            header: 'Họ và tên',
            getValue: (row) => row.full_name ?? '',
         },
         {
            header: 'Email',
            getValue: (row) => row.email ?? '',
         },
         {
            header: 'Số điện thoại',
            getValue: (row) => row.phone ?? '',
         },
         {
            header: 'CCCD / CMND',
            getValue: (row) => row.citizen_id ?? '',
         },
         {
            header: 'Danh xưng người đại diện',
            getValue: (row) => getEffectiveRepresentativeSalutation(row),
         },
         {
            header: 'Người đại diện',
            getValue: (row) => getEffectiveRepresentative(row),
         },
         {
            header: 'SĐT người đại diện',
            getValue: (row) => getEffectiveRepresentativePhone(row),
         },
         {
            header: 'Công ty / Đơn vị',
            getValue: (row) => row.company_name ?? '',
         },
         {
            header: 'Phòng ban',
            getValue: (row) => row.department ?? '',
         },
         {
            header: 'Sale phụ trách',
            getValue: (row) => row.sale_in_charge ?? '',
         },
         {
            header: 'Lưu trú',
            getValue: (row) => (row.accommodation ? 'Có' : 'Không'),
         },
         {
            header: 'Trạng thái email',
            getValue: (row) => formatEmailStatus(row.email_status),
         },
         {
            header: 'Thời gian gửi email',
            getValue: (row) => formatDateTime(row.email_sent_at),
         },
         {
            header: 'Đã check-in',
            getValue: (row) => (row.is_checked_in ? 'Có' : 'Không'),
         },
         {
            header: 'Thời gian check-in',
            getValue: (row) => formatDateTime(row.checked_in_at),
         },
         {
            header: 'Phương thức check-in',
            getValue: (row) => formatCheckInMethod(row.check_in_method),
         },
         {
            header: 'Được quay thưởng',
            getValue: (row) => (row.is_draw_eligible ? 'Có' : 'Không'),
         },
         {
            header: 'Đã trúng giải',
            getValue: (row) => (row.has_won ? 'Có' : 'Không'),
         },
         {
            header: 'Thời gian tạo',
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
