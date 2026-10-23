import { useMemo, useState, useTransition } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { getAll as getAllWinners } from '@/modules/admin/services/lucky-draw/winner/get-all';
import { logExport } from '@/modules/admin/services/lucky-draw/winner/log-export';

import type { AttendantRow } from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type AttendantFilterOption =
   | 'ALL'
   | 'CHECKED_IN'
   | 'NOT_CHECKED_IN'
   | 'WINNER'
   | 'NOT_WINNER'
   | 'EMAIL_SENT'
   | 'EMAIL_NOT_SENT'
   | 'EMAIL_FAILED';

export type AttendantsPanelProps = {
   gameId: string;
   attendants: AttendantRow[];
   isLoading: boolean;
};

export function useLogic(props: AttendantsPanelProps) {
   const { gameId, attendants, isLoading } = props;

   const [searchQuery, setSearchQuery] = useState('');
   const [filterValue, setFilterValue] = useState<AttendantFilterOption>('ALL');
   const [isExporting, startExportTransition] = useTransition();

   const filteredAttendants = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();

      return attendants.filter((item) => {
         if (normalizedSearch) {
            const matchesName = item.full_name.toLowerCase().includes(normalizedSearch);
            const matchesPhone = (item.phone ?? '').toLowerCase().includes(normalizedSearch);
            const matchesEmail = (item.email ?? '').toLowerCase().includes(normalizedSearch);

            if (!matchesName && !matchesPhone && !matchesEmail) {
               return false;
            }
         }

         switch (filterValue) {
            case 'CHECKED_IN':
               return Boolean(item.is_checked_in);
            case 'NOT_CHECKED_IN':
               return !item.is_checked_in;
            case 'WINNER':
               return Boolean(item.has_won);
            case 'NOT_WINNER':
               return !item.has_won;
            case 'EMAIL_SENT':
               return item.email_status === 'SENT';
            case 'EMAIL_NOT_SENT':
               return (item.email_status ?? 'NOT_SENT') === 'NOT_SENT';
            case 'EMAIL_FAILED':
               return item.email_status === 'FAILED';
            default:
               return true;
         }
      });
   }, [attendants, searchQuery, filterValue]);

   function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSearchQuery(event.target.value);
   }

   function handleClearSearch() {
      setSearchQuery('');
   }

   function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const val = event.target.value;
      if (
         val === 'ALL' ||
         val === 'CHECKED_IN' ||
         val === 'NOT_CHECKED_IN' ||
         val === 'WINNER' ||
         val === 'NOT_WINNER' ||
         val === 'EMAIL_SENT' ||
         val === 'EMAIL_NOT_SENT' ||
         val === 'EMAIL_FAILED'
      ) {
         setFilterValue(val);
      }
   }

   function handleExportWinnerCsv() {
      if (!gameId) return;

      startExportTransition(async () => {
         try {
            const response = await getAllWinners({
               gameId,
               page: 1,
               limit: 5000,
            });

            const rows = response.items;
            const csvData = rows.map((row, index) => ({
               no: index + 1,
               won_at: row.won_at ?? '',
               prize_tier: row.lucky_draw_prizes?.tier_order ?? '',
               prize_name: row.lucky_draw_prizes?.name ?? '',
               full_name: row.lucky_draw_attendants?.full_name ?? '',
               phone: row.lucky_draw_attendants?.phone ?? '',
               email: row.lucky_draw_attendants?.email ?? '',
               ticket_code: row.lucky_draw_attendants?.ticket_code ?? '',
               company_name: row.lucky_draw_attendants?.company_name ?? '',
               department: row.lucky_draw_attendants?.department ?? '',
               drawn_by: row.accounts?.full_name ?? row.accounts?.email ?? '',
            }));

            const csvString = `\uFEFF${Papa.unparse(csvData)}`;
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
               'download',
               `lucky-draw-winners-${gameId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            await logExport({
               gameId,
               exportedCount: rows.length,
            });

            toast.success(`Exported ${rows.length} winner records to CSV.`);
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to export winner CSV.');
         }
      });
   }

   return {
      param: {
         isLoading,
         isExporting,
         searchQuery,
         filterValue,
         totalCount: attendants.length,
         filteredAttendants,
      },
      func: {
         handleSearchChange,
         handleClearSearch,
         handleFilterChange,
         handleExportWinnerCsv,
      },
   };
}

