import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { bulkImport } from '@/modules/admin/services/lucky-draw/attendant/bulk-import';
import { create } from '@/modules/admin/services/lucky-draw/attendant/create';
import { deleteById } from '@/modules/admin/services/lucky-draw/attendant/delete-by-id';
import { sendBatchEmail } from '@/modules/admin/services/lucky-draw/attendant/send-batch-email';
import { update } from '@/modules/admin/services/lucky-draw/attendant/update';
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

export const attendantQuickSchema = z.object({
   full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
   ticket_code: z.string().trim().min(1, 'Ticket code is required.'),
   email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
   phone: z.string().trim().optional().or(z.literal('')),
   company_name: z.string().trim().optional().or(z.literal('')),
   department: z.string().trim().optional().or(z.literal('')),
   email_status: z.enum(['NOT_SENT', 'SENDING', 'SENT', 'FAILED']),
   is_checked_in: z.boolean(),
   has_won: z.boolean(),
});

export type AttendantQuickFormValues = z.infer<typeof attendantQuickSchema>;

export type AttendantsPanelProps = {
   gameId: string;
   attendants: AttendantRow[];
   isLoading: boolean;
   onRefresh: () => Promise<void>;
};

const CSV_INPUT_ID = 'overview-attendant-csv-upload-input';
const PAGE_SIZE_OPTIONS: ReadonlyArray<number> = [10, 20, 50, 100];

export function useLogic(props: AttendantsPanelProps) {
   const { gameId, attendants, isLoading, onRefresh } = props;

   const [searchQuery, setSearchQuery] = useState('');
   const [filterValue, setFilterValue] = useState<AttendantFilterOption>('ALL');
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(20);

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingAttendant, setEditingAttendant] = useState<AttendantRow | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AttendantRow | null>(null);

   const [isPending, startTransition] = useTransition();

   const form = useForm<AttendantQuickFormValues>({
      resolver: zodResolver(attendantQuickSchema),
      defaultValues: {
         full_name: '',
         ticket_code: '',
         email: '',
         phone: '',
         company_name: '',
         department: '',
         email_status: 'NOT_SENT',
         is_checked_in: false,
         has_won: false,
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = form;

   const filteredAttendants = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();

      return attendants.filter((item) => {
         if (normalizedSearch) {
            const matchesName = item.full_name.toLowerCase().includes(normalizedSearch);
            const matchesPhone = (item.phone ?? '').toLowerCase().includes(normalizedSearch);
            const matchesEmail = (item.email ?? '').toLowerCase().includes(normalizedSearch);
            const matchesTicket = item.ticket_code.toLowerCase().includes(normalizedSearch);

            if (!matchesName && !matchesPhone && !matchesEmail && !matchesTicket) {
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

   const totalPages = Math.max(1, Math.ceil(filteredAttendants.length / limit));
   const currentPage = Math.min(page, totalPages);

   const paginatedAttendants = useMemo(() => {
      const start = (currentPage - 1) * limit;
      return filteredAttendants.slice(start, start + limit);
   }, [filteredAttendants, currentPage, limit]);

   const rangeStart = filteredAttendants.length === 0 ? 0 : (currentPage - 1) * limit + 1;
   const rangeEnd = Math.min(filteredAttendants.length, currentPage * limit);

   function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSearchQuery(event.target.value);
      setPage(1);
   }

   function handleClearSearch() {
      setSearchQuery('');
      setPage(1);
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
         setPage(1);
      }
   }

   function handlePageChange(nextPage: number) {
      if (nextPage < 1 || nextPage > totalPages) return;
      setPage(nextPage);
   }

   function handleLimitChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const parsed = Number(event.target.value);
      if (PAGE_SIZE_OPTIONS.includes(parsed)) {
         setLimit(parsed);
         setPage(1);
      }
   }

   function handleOpenCreateModal() {
      const nextTicket = `TKT-${String(attendants.length + 1).padStart(4, '0')}`;
      setEditingAttendant(null);
      reset({
         full_name: '',
         ticket_code: nextTicket,
         email: '',
         phone: '',
         company_name: '',
         department: '',
         email_status: 'NOT_SENT',
         is_checked_in: false,
         has_won: false,
      });
      setIsModalOpen(true);
   }

   function handleOpenEditModal(item: AttendantRow) {
      setEditingAttendant(item);
      reset({
         full_name: item.full_name,
         ticket_code: item.ticket_code,
         email: item.email ?? '',
         phone: item.phone ?? '',
         company_name: item.company_name ?? '',
         department: item.department ?? '',
         email_status: item.email_status ?? 'NOT_SENT',
         is_checked_in: Boolean(item.is_checked_in),
         has_won: Boolean(item.has_won),
      });
      setIsModalOpen(true);
   }

   function handleCloseModal() {
      if (isPending) return;
      setIsModalOpen(false);
      setEditingAttendant(null);
   }

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            if (editingAttendant) {
               await update({
                  id: editingAttendant.id,
                  attendant: {
                     full_name: values.full_name,
                     ticket_code: values.ticket_code,
                     email: values.email || null,
                     phone: values.phone || null,
                     company_name: values.company_name || null,
                     department: values.department || null,
                     email_status: values.email_status,
                     is_checked_in: values.is_checked_in,
                     has_won: values.has_won,
                     updated_at: new Date().toISOString(),
                  },
               });
               toast.success(`Updated attendant "${values.full_name}".`);
            } else {
               await create({
                  attendant: {
                     game_id: gameId,
                     full_name: values.full_name,
                     ticket_code: values.ticket_code,
                     email: values.email || null,
                     phone: values.phone || null,
                     company_name: values.company_name || null,
                     department: values.department || null,
                     email_status: values.email_status,
                     is_checked_in: values.is_checked_in,
                     has_won: values.has_won,
                  },
               });
               toast.success(`Created attendant "${values.full_name}".`);
            }
            setIsModalOpen(false);
            setEditingAttendant(null);
            await onRefresh();
         } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save attendant.';
            form.setError('root', { message });
            toast.error(message);
         }
      });
   });

   function handlePromptDelete(item: AttendantRow) {
      setDeleteTarget(item);
   }

   function handleCancelDelete() {
      setDeleteTarget(null);
   }

   function handleConfirmDelete() {
      if (!deleteTarget) return;
      const target = deleteTarget;
      startTransition(async () => {
         try {
            await deleteById({ id: target.id });
            toast.success(`Deleted attendant "${target.full_name}".`);
            setDeleteTarget(null);
            await onRefresh();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete attendant.');
         }
      });
   }

   function handleSendBatchEmails() {
      const targetIds = filteredAttendants
         .filter((item) => Boolean(item.email && item.email.trim()))
         .map((item) => item.id);

      if (targetIds.length === 0) {
         toast.error('No attendants with an email address in the current view.');
         return;
      }

      startTransition(async () => {
         try {
            const res = await sendBatchEmail({ attendantIds: targetIds });
            if (res.failedCount > 0) {
               toast.warning(
                  `Batch email completed: ${res.sentCount} sent, ${res.skippedCount} skipped, ${res.failedCount} failed.`,
               );
            } else {
               toast.success(`Dispatched QR tickets to ${res.sentCount} attendants.`);
            }
            await onRefresh();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to send batch emails.');
         }
      });
   }

   function handleTriggerImportCsv() {
      const inputEl = document.getElementById(CSV_INPUT_ID);
      if (inputEl instanceof HTMLInputElement) {
         inputEl.click();
      }
   }

   function handleImportCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse<Record<string, string>>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const rows = results.data;
            if (rows.length === 0) {
               toast.error('The selected CSV file is empty.');
               event.target.value = '';
               return;
            }

            startTransition(async () => {
               try {
                  const mappedRows = rows
                     .map((row, idx) => {
                        const fullName = (row.full_name ?? row.name ?? row.Name ?? '').trim();
                        const ticketCode = (
                           row.ticket_code ??
                           row.ticket ??
                           row.Ticket ??
                           `TKT-${String(idx + 1).padStart(4, '0')}`
                        ).trim();
                        return {
                           game_id: gameId,
                           full_name: fullName,
                           ticket_code: ticketCode,
                           email: (row.email ?? row.Email ?? '').trim() || null,
                           phone: (row.phone ?? row.Phone ?? '').trim() || null,
                           company_name: (row.company_name ?? row.company ?? '').trim() || null,
                           department: (row.department ?? row.Department ?? '').trim() || null,
                        };
                     })
                     .filter((item) => Boolean(item.full_name && item.ticket_code));

                  if (mappedRows.length === 0) {
                     throw new Error('No valid attendee rows found. Ensure full_name and ticket_code columns exist.');
                  }

                  const response = await bulkImport({ rows: mappedRows });
                  toast.success(`Imported ${response.importedCount} attendants from CSV.`);
                  await onRefresh();
               } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Failed during attendant CSV import.');
               } finally {
                  event.target.value = '';
               }
            });
         },
         error: (error) => {
            toast.error(`CSV Parse Error: ${error.message}`);
            event.target.value = '';
         },
      });
   }

   function handleExportWinnerCsv() {
      if (!gameId) return;

      startTransition(async () => {
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
         isPending,
         searchQuery,
         filterValue,
         totalCount: attendants.length,
         filteredAttendants,
         paginatedAttendants,
         page: currentPage,
         limit,
         pageSizeOptions: PAGE_SIZE_OPTIONS,
         totalPages,
         rangeStart,
         rangeEnd,
         isModalOpen,
         isEdit: Boolean(editingAttendant),
         deleteTarget,
         isDirty,
         errors,
         csvInputId: CSV_INPUT_ID,
      },
      func: {
         register,
         handleSearchChange,
         handleClearSearch,
         handleFilterChange,
         handlePageChange,
         handleLimitChange,
         handleOpenCreateModal,
         handleOpenEditModal,
         handleCloseModal,
         onSubmit,
         handlePromptDelete,
         handleCancelDelete,
         handleConfirmDelete,
         handleSendBatchEmails,
         handleTriggerImportCsv,
         handleImportCsvFile,
         handleExportWinnerCsv,
      },
   };
}
