import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { bulkImport } from '@/modules/admin/services/lucky-draw/attendant/bulk-import';
import { create } from '@/modules/admin/services/lucky-draw/attendant/create';
import { deleteById } from '@/modules/admin/services/lucky-draw/attendant/delete-by-id';
import { getAll } from '@/modules/admin/services/lucky-draw/attendant/get-all';
import { getContext } from '@/modules/admin/services/lucky-draw/attendant/get-context';
import { sendBatchEmail } from '@/modules/admin/services/lucky-draw/attendant/send-batch-email';
import { update } from '@/modules/admin/services/lucky-draw/attendant/update';

import type {
   AttendantWithRelations,
   EmailStatus,
} from '@/modules/admin/services/lucky-draw/attendant/get-all/type';
import type { GameOption } from '@/modules/admin/services/lucky-draw/attendant/get-context/type';

export type PresetView = 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'WINNERS';
export type EmailFilter = EmailStatus | 'ALL';
export type SortField = 'created_at' | 'full_name' | 'ticket_code' | 'email_status' | 'checked_in_at';
export type SortOrder = 'asc' | 'desc';

const CSV_INPUT_ID = 'lucky-draw-attendant-csv-upload-input';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams.get('q') ?? '';
   const rawPreset = searchParams.get('preset');
   const presetView: PresetView =
      rawPreset === 'CHECKED_IN' || rawPreset === 'NOT_CHECKED_IN' || rawPreset === 'WINNERS'
         ? rawPreset
         : 'ALL';

   const rawGame = searchParams.get('game');
   const gameFilter = rawGame ?? 'ALL';

   const rawEmail = searchParams.get('emailStatus');
   const emailFilter: EmailFilter =
      rawEmail === 'NOT_SENT' || rawEmail === 'SENDING' || rawEmail === 'SENT' || rawEmail === 'FAILED'
         ? rawEmail
         : 'ALL';

   const rawSortBy = searchParams.get('sortBy');
   const sortBy: SortField =
      rawSortBy === 'full_name' ||
      rawSortBy === 'ticket_code' ||
      rawSortBy === 'email_status' ||
      rawSortBy === 'checked_in_at'
         ? rawSortBy
         : 'created_at';

   const rawSortOrder = searchParams.get('sortOrder');
   const sortOrder: SortOrder = rawSortOrder === 'asc' ? 'asc' : 'desc';

   const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
   const limit = Math.max(5, Number(searchParams.get('limit') ?? '20') || 20);

   const [searchInput, setSearchInput] = useState(urlQuery);
   const [items, setItems] = useState<AttendantWithRelations[]>([]);
   const [total, setTotal] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [games, setGames] = useState<GameOption[]>([]);

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AttendantWithRelations | null>(null);
   const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

   const [isPendingMutation, startMutationTransition] = useTransition();

   const updateUrl = useCallback(
      (updates: Record<string, string | null>) => {
         const params = new URLSearchParams(searchParams.toString());
         Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === 'ALL') {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         });
         const qs = params.toString();
         router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      },
      [pathname, router, searchParams],
   );

   useEffect(() => {
      let active = true;
      getContext()
         .then((ctx) => {
            if (!active) return;
            setGames(ctx.games);
         })
         .catch(() => {
            // Context load error handled by main query
         });

      return () => {
         active = false;
      };
   }, []);

   useEffect(() => {
      const timer = setTimeout(() => {
         if (searchInput !== urlQuery) {
            updateUrl({ q: searchInput || null, page: '1' });
         }
      }, 300);
      return () => clearTimeout(timer);
   }, [searchInput, urlQuery, updateUrl]);

   const checkInFilter: 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' =
      presetView === 'CHECKED_IN'
         ? 'CHECKED_IN'
         : presetView === 'NOT_CHECKED_IN'
           ? 'NOT_CHECKED_IN'
           : 'ALL';

   const winnerFilter: 'ALL' | 'WINNER' | 'NOT_WINNER' = presetView === 'WINNERS' ? 'WINNER' : 'ALL';

   const fetchAttendants = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await getAll({
            search: urlQuery,
            gameId: gameFilter,
            emailStatus: emailFilter,
            checkInFilter,
            winnerFilter,
            sortBy,
            sortOrder,
            page,
            limit,
         });
         setItems(response.items);
         setTotal(response.total);
         setSelectedIds([]);
      } catch (error: unknown) {
         toast.error(error instanceof Error ? error.message : 'Failed to load attendants.');
      } finally {
         setIsLoading(false);
      }
   }, [urlQuery, gameFilter, emailFilter, checkInFilter, winnerFilter, sortBy, sortOrder, page, limit]);

   useEffect(() => {
      let active = true;
      getAll({
         search: urlQuery,
         gameId: gameFilter,
         emailStatus: emailFilter,
         checkInFilter,
         winnerFilter,
         sortBy,
         sortOrder,
         page,
         limit,
      })
         .then((response) => {
            if (!active) return;
            setItems(response.items);
            setTotal(response.total);
            setSelectedIds([]);
         })
         .catch((error: unknown) => {
            if (!active) return;
            toast.error(error instanceof Error ? error.message : 'Failed to load attendants.');
         })
         .finally(() => {
            if (active) {
               setIsLoading(false);
            }
         });

      return () => {
         active = false;
      };
   }, [urlQuery, gameFilter, emailFilter, checkInFilter, winnerFilter, sortBy, sortOrder, page, limit]);

   function handlePresetChange(nextPreset: PresetView) {
      setIsLoading(true);
      updateUrl({ preset: nextPreset === 'ALL' ? null : nextPreset, page: '1' });
   }

   function handleGameFilterChange(nextGameId: string) {
      setIsLoading(true);
      updateUrl({ game: nextGameId === 'ALL' ? null : nextGameId, page: '1' });
   }

   function handleEmailFilterChange(nextEmailStatus: EmailFilter) {
      setIsLoading(true);
      updateUrl({ emailStatus: nextEmailStatus === 'ALL' ? null : nextEmailStatus, page: '1' });
   }

   function handleSortFieldChange(value: string) {
      if (
         value === 'created_at' ||
         value === 'full_name' ||
         value === 'ticket_code' ||
         value === 'email_status' ||
         value === 'checked_in_at'
      ) {
         setIsLoading(true);
         updateUrl({ sortBy: value, page: '1' });
      }
   }

   function handleToggleSortOrder() {
      setIsLoading(true);
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
   }

   function handlePageChange(nextPage: number) {
      setIsLoading(true);
      updateUrl({ page: String(nextPage) });
   }

   function handleLimitChange(nextLimit: string) {
      setIsLoading(true);
      updateUrl({ limit: nextLimit, page: '1' });
   }

   function handleClearSearch() {
      setIsLoading(true);
      setSearchInput('');
      updateUrl({ q: null, page: '1' });
   }

   function handleClearAllFilters() {
      setIsLoading(true);
      setSearchInput('');
      updateUrl({ q: null, preset: null, game: null, emailStatus: null, page: '1' });
   }

   function handleToggleSelectAll() {
      if (items.length === 0) return;
      if (selectedIds.length === items.length) {
         setSelectedIds([]);
      } else {
         setSelectedIds(items.map((item) => item.id));
      }
   }

   function handleToggleSelectRow(id: string) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
   }

   function clearSelection() {
      setSelectedIds([]);
   }

   function handleNavigateCreate() {
      router.push(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.UPDATE(id));
   }

   function handleToggleRowMenu(id: string) {
      setOpenMenuId((prev) => (prev === id ? null : id));
   }

   function handleCloseRowMenu() {
      setOpenMenuId(null);
   }

   function handleDuplicateRow(attendant: AttendantWithRelations) {
      setOpenMenuId(null);
      startMutationTransition(async () => {
         try {
            await create({
               attendant: {
                  game_id: attendant.game_id,
                  full_name: `${attendant.full_name} (Copy)`,
                  ticket_code: `${attendant.ticket_code}-COPY`,
                  email: attendant.email,
                  phone: attendant.phone,
                  company_name: attendant.company_name,
                  department: attendant.department,
                  custom_metadata: attendant.custom_metadata,
                  email_status: 'NOT_SENT',
                  is_checked_in: false,
                  has_won: false,
               },
            });
            toast.success(`Duplicated "${attendant.full_name}".`);
            await fetchAttendants();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to duplicate attendant.');
         }
      });
   }

   function handleSendBatchEmails() {
      if (selectedIds.length === 0) return;
      startMutationTransition(async () => {
         try {
            const res = await sendBatchEmail({ attendantIds: selectedIds });
            if (res.failedCount > 0) {
               toast.warning(
                  `Batch email completed: ${res.sentCount} sent, ${res.skippedCount} skipped (no email), ${res.failedCount} failed.`,
               );
            } else {
               toast.success(
                  `Dispatched QR tickets to ${res.sentCount} attendees (${res.skippedCount} skipped without email).`,
               );
            }
            await fetchAttendants();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to send batch emails.');
         }
      });
   }

   function handleBulkCheckIn() {
      if (selectedIds.length === 0) return;
      const nowIso = new Date().toISOString();
      startMutationTransition(async () => {
         try {
            await Promise.all(
               selectedIds.map((id) =>
                  update({
                     id,
                     attendant: {
                        is_checked_in: true,
                        checked_in_at: nowIso,
                        check_in_method: 'MANUAL_SEARCH',
                     },
                  }),
               ),
            );
            toast.success(`Checked in ${selectedIds.length} attendees.`);
            await fetchAttendants();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to check in selected attendees.');
         }
      });
   }

   function handlePromptDelete(attendant: AttendantWithRelations) {
      setOpenMenuId(null);
      setDeleteTarget(attendant);
   }

   function handleCancelDelete() {
      setDeleteTarget(null);
   }

   function handleConfirmDelete() {
      if (!deleteTarget) return;
      const target = deleteTarget;
      startMutationTransition(async () => {
         try {
            await deleteById({ id: target.id });
            toast.success(`Deleted "${target.full_name}".`);
            setDeleteTarget(null);
            await fetchAttendants();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete attendant.');
         }
      });
   }

   function handleOpenBulkDelete() {
      setIsBulkDeleteOpen(true);
   }

   function handleCancelBulkDelete() {
      setIsBulkDeleteOpen(false);
   }

   function handleConfirmBulkDelete() {
      if (selectedIds.length === 0) return;
      startMutationTransition(async () => {
         try {
            await Promise.all(selectedIds.map((id) => deleteById({ id })));
            toast.success(`Deleted ${selectedIds.length} attendees.`);
            setIsBulkDeleteOpen(false);
            await fetchAttendants();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete selected attendees.');
         }
      });
   }

   function exportRowsToCsv(rows: AttendantWithRelations[], filename: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         game_id: row.game_id,
         game_name: row.games?.name ?? '',
         event_name: row.games?.events?.name ?? '',
         full_name: row.full_name,
         ticket_code: row.ticket_code,
         email: row.email ?? '',
         phone: row.phone ?? '',
         company_name: row.company_name ?? '',
         department: row.department ?? '',
         qr_code_payload: row.qr_code_payload,
         email_status: row.email_status ?? 'NOT_SENT',
         email_sent_at: row.email_sent_at ?? '',
         is_checked_in: Boolean(row.is_checked_in),
         checked_in_at: row.checked_in_at ?? '',
         check_in_method: row.check_in_method ?? '',
         has_won: Boolean(row.has_won),
         created_at: row.created_at ?? '',
      }));
      const csvString = Papa.unparse(csvData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} attendees to CSV.`);
   }

   function handleExportAllCsv() {
      exportRowsToCsv(items, `lucky-draw-attendants-${new Date().toISOString().slice(0, 10)}.csv`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      exportRowsToCsv(selectedRows, `lucky-draw-attendants-selected-${new Date().toISOString().slice(0, 10)}.csv`);
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
               return;
            }
            const fallbackGameId = gameFilter !== 'ALL' ? gameFilter : games[0]?.id ?? '';
            startMutationTransition(async () => {
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
                        const targetGameId = (row.game_id ?? '').trim() || fallbackGameId;
                        return {
                           game_id: targetGameId,
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

                  if (mappedRows.some((item) => !item.game_id)) {
                     throw new Error('Please select or create a Lucky Draw game before importing attendees.');
                  }

                  const response = await bulkImport({ rows: mappedRows });
                  toast.success(`Imported ${response.importedCount} attendees with unique QR payloads.`);
                  await fetchAttendants();
               } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Failed during CSV import.');
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

   function formatDate(iso: string | null) {
      if (!iso) return '—';
      return new Date(iso).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
      });
   }

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const isAllSelected = items.length > 0 && selectedIds.length === items.length;
   const hasActiveFilters = Boolean(
      urlQuery || presetView !== 'ALL' || gameFilter !== 'ALL' || emailFilter !== 'ALL',
   );

   return {
      param: {
         items,
         total,
         page,
         limit,
         totalPages,
         rangeStart,
         rangeEnd,
         isLoading,
         isPendingMutation,
         searchInput,
         urlQuery,
         presetView,
         gameFilter,
         emailFilter,
         games,
         sortBy,
         sortOrder,
         selectedIds,
         isAllSelected,
         hasActiveFilters,
         openMenuId,
         deleteTarget,
         isBulkDeleteOpen,
         csvInputId: CSV_INPUT_ID,
      },
      func: {
         setSearchInput,
         handlePresetChange,
         handleGameFilterChange,
         handleEmailFilterChange,
         handleSortFieldChange,
         handleToggleSortOrder,
         handlePageChange,
         handleLimitChange,
         handleClearSearch,
         handleClearAllFilters,
         handleToggleSelectAll,
         handleToggleSelectRow,
         clearSelection,
         handleNavigateCreate,
         handleNavigateEdit,
         handleToggleRowMenu,
         handleCloseRowMenu,
         handleDuplicateRow,
         handleSendBatchEmails,
         handleBulkCheckIn,
         handlePromptDelete,
         handleCancelDelete,
         handleConfirmDelete,
         handleOpenBulkDelete,
         handleCancelBulkDelete,
         handleConfirmBulkDelete,
         handleExportAllCsv,
         handleBulkExportCsv,
         handleTriggerImportCsv,
         handleImportCsvFile,
         formatDate,
      },
   };
}
