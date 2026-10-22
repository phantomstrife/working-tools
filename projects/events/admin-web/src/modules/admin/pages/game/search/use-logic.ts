import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/game/get-context';
import { getAll } from '@/modules/admin/services/game/get-all';
import { create } from '@/modules/admin/services/game/create';
import { update } from '@/modules/admin/services/game/update';
import { deleteById } from '@/modules/admin/services/game/delete-by-id';

import type {
   GameSortField,
   GameStatus,
   GameType,
   GameWithEvent,
   SortOrder,
} from '@/modules/admin/services/game/get-all/type';
import type { CallerAccount, EventOption } from '@/modules/admin/services/game/get-context/type';

export type StatusFilter = GameStatus | 'ALL';
export type GameTypeFilter = GameType | 'ALL';

export interface CsvGameRow {
   name?: string;
   event_id?: string;
   game_type?: string;
   description?: string;
   status?: string;
   is_dev_only?: string;
}

const VALID_STATUSES: ReadonlyArray<GameStatus> = ['PENDING', 'READY', 'LIVE', 'FINISHED'];
const VALID_GAME_TYPES: ReadonlyArray<GameType> = ['LUCKY_DRAW'];
const VALID_SORT_FIELDS: ReadonlyArray<GameSortField> = ['name', 'created_at', 'updated_at', 'status'];
const CSV_INPUT_ID = 'game-csv-upload-input';

function parseStatusFilter(value: string | null): StatusFilter {
   if (value === 'PENDING' || value === 'READY' || value === 'LIVE' || value === 'FINISHED') {
      return value;
   }
   return 'ALL';
}

function parseGameTypeFilter(value: string | null): GameTypeFilter {
   if (value === 'LUCKY_DRAW') {
      return value;
   }
   return 'ALL';
}

function parseSortField(value: string | null): GameSortField {
   if (value === 'name' || value === 'created_at' || value === 'updated_at' || value === 'status') {
      return value;
   }
   return 'created_at';
}

function parseSortOrder(value: string | null): SortOrder {
   return value === 'asc' ? 'asc' : 'desc';
}

function parsePositiveInt(value: string | null, fallback: number): number {
   if (!value) return fallback;
   const parsed = Number.parseInt(value, 10);
   return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams?.get('q') ?? '';
   const statusFilter = parseStatusFilter(searchParams?.get('status') ?? null);
   const gameTypeFilter = parseGameTypeFilter(searchParams?.get('gameType') ?? null);
   const eventFilter = searchParams?.get('eventId') ?? 'ALL';
   const sortBy = parseSortField(searchParams?.get('sortBy') ?? null);
   const sortOrder = parseSortOrder(searchParams?.get('sortOrder') ?? null);
   const page = parsePositiveInt(searchParams?.get('page') ?? null, 1);
   const limit = parsePositiveInt(searchParams?.get('limit') ?? null, 20);

   const [searchInput, setSearchInput] = useState<string>(urlQuery);
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [events, setEvents] = useState<EventOption[]>([]);
   const [items, setItems] = useState<GameWithEvent[]>([]);
   const [total, setTotal] = useState<number>(0);
   const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<GameWithEvent | null>(null);
   const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false);

   const [isFetching, startFetchTransition] = useTransition();
   const [isPendingMutation, startMutationTransition] = useTransition();

   const isLoading = !hasLoadedOnce || isFetching;
   const isSuperAdmin = caller?.role !== 'ADMIN';

   const updateUrlParams = useCallback(
      (updates: Record<string, string | null>) => {
         const params = new URLSearchParams(searchParams?.toString() ?? '');

         Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === '' || val === 'ALL') {
               params.delete(key);
            } else {
               params.set(key, val);
            }
         });

         const queryString = params.toString();
         const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
         router.replace(targetUrl, { scroll: false });
      },
      [pathname, router, searchParams],
   );

   useEffect(() => {
      let isMounted = true;
      getContext()
         .then((res) => {
            if (!isMounted) return;
            setCaller(res.caller);
            setEvents(res.events);
         })
         .catch(() => {
            // Non-blocking context load
         });

      return () => {
         isMounted = false;
      };
   }, []);

   useEffect(() => {
      const timer = window.setTimeout(() => {
         if (searchInput !== urlQuery) {
            updateUrlParams({ q: searchInput.trim() || null, page: '1' });
         }
      }, 350);

      return () => {
         window.clearTimeout(timer);
      };
   }, [searchInput, updateUrlParams, urlQuery]);

   const fetchGames = useCallback(() => {
      startFetchTransition(async () => {
         try {
            const response = await getAll({
               search: urlQuery,
               status: statusFilter,
               gameType: gameTypeFilter,
               eventId: eventFilter,
               page,
               limit,
               sortBy,
               sortOrder,
            });

            setItems(response.items);
            setTotal(response.total);
            setSelectedIds((prev) => prev.filter((id) => response.items.some((item) => item.id === id)));
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load games.';
            toast.error(message);
         } finally {
            setHasLoadedOnce(true);
         }
      });
   }, [eventFilter, gameTypeFilter, limit, page, sortBy, sortOrder, statusFilter, urlQuery]);

   useEffect(() => {
      fetchGames();
   }, [fetchGames]);

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const hasActiveFilters = Boolean(
      urlQuery.trim() || statusFilter !== 'ALL' || gameTypeFilter !== 'ALL' || eventFilter !== 'ALL',
   );
   const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

   function handleStatusChange(nextStatus: StatusFilter) {
      updateUrlParams({
         status: nextStatus === 'ALL' ? null : nextStatus,
         page: '1',
      });
   }

   function handleGameTypeChange(nextType: string) {
      const parsed = parseGameTypeFilter(nextType);
      updateUrlParams({
         gameType: parsed === 'ALL' ? null : parsed,
         page: '1',
      });
   }

   function handleEventFilterChange(nextEventId: string) {
      updateUrlParams({
         eventId: nextEventId === 'ALL' ? null : nextEventId,
         page: '1',
      });
   }

   function handleSortFieldChange(nextField: string) {
      const validated = VALID_SORT_FIELDS.find((f) => f === nextField) ?? 'created_at';
      updateUrlParams({
         sortBy: validated,
         page: '1',
      });
   }

   function handleToggleSortOrder() {
      updateUrlParams({
         sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
         page: '1',
      });
   }

   function handlePageChange(nextPage: number) {
      if (nextPage < 1 || nextPage > totalPages) return;
      updateUrlParams({ page: String(nextPage) });
   }

   function handleLimitChange(nextLimit: string) {
      const parsed = parsePositiveInt(nextLimit, 20);
      updateUrlParams({ limit: String(parsed), page: '1' });
   }

   function handleClearSearch() {
      setSearchInput('');
      updateUrlParams({ q: null, page: '1' });
   }

   function handleClearAllFilters() {
      setSearchInput('');
      updateUrlParams({
         q: null,
         status: null,
         gameType: null,
         eventId: null,
         page: '1',
      });
   }

   function handleToggleSelectAll() {
      if (isAllSelected) {
         setSelectedIds([]);
      } else {
         setSelectedIds(items.map((item) => item.id));
      }
   }

   function handleToggleSelectRow(id: string) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
   }

   function handleToggleRowMenu(id: string) {
      setOpenMenuId((prev) => (prev === id ? null : id));
   }

   function handleCloseRowMenu() {
      setOpenMenuId(null);
   }

   function handleNavigateCreate() {
      router.push(ROUTE.ADMIN.GAME.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.GAME.UPDATE(id));
   }

   function handleDuplicateRow(gameItem: GameWithEvent) {
      setOpenMenuId(null);
      router.push(`${ROUTE.ADMIN.GAME.CREATE}?duplicateId=${encodeURIComponent(gameItem.id)}`);
   }

   function handlePromptDelete(gameItem: GameWithEvent) {
      setOpenMenuId(null);
      setDeleteTarget(gameItem);
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
            setDeleteTarget(null);
            setSelectedIds((prev) => prev.filter((id) => id !== target.id));
            toast.success(`Deleted game "${target.name}" successfully.`);
            fetchGames();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete game.';
            toast.error(message);
         }
      });
   }

   function handleBulkStatusChange(nextStatus: GameStatus) {
      if (selectedIds.length === 0) return;

      startMutationTransition(async () => {
         try {
            const now = new Date().toISOString();
            await Promise.all(
               selectedIds.map((id) =>
                  update({
                     id,
                     game: { status: nextStatus, updated_at: now },
                  }),
               ),
            );
            toast.success(`Updated status to ${nextStatus} for ${selectedIds.length} games.`);
            setSelectedIds([]);
            fetchGames();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk status update failed.';
            toast.error(message);
         }
      });
   }

   function handleOpenBulkDelete() {
      if (selectedIds.length === 0) return;
      setIsBulkDeleteOpen(true);
   }

   function handleCancelBulkDelete() {
      setIsBulkDeleteOpen(false);
   }

   function handleConfirmBulkDelete() {
      if (selectedIds.length === 0) return;
      const count = selectedIds.length;

      startMutationTransition(async () => {
         try {
            await Promise.all(selectedIds.map((id) => deleteById({ id })));
            setIsBulkDeleteOpen(false);
            setSelectedIds([]);
            toast.success(`Deleted ${count} selected games.`);
            fetchGames();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk delete failed.';
            toast.error(message);
         }
      });
   }

   function exportRowsToCsv(rows: GameWithEvent[], filenamePrefix: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         name: row.name,
         event_id: row.event_id,
         event_name: row.events?.name ?? '',
         game_type: row.game_type,
         description: row.description ?? '',
         status: row.status ?? 'PENDING',
         is_dev_only: row.is_dev_only ? 'true' : 'false',
         assigned_staff_count: row.game_accounts?.length ?? 0,
         created_at: row.created_at ?? '',
         updated_at: row.updated_at ?? '',
      }));

      const csvString = Papa.unparse(csvData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   }

   function handleExportAllCsv() {
      if (items.length === 0) {
         toast.error('No records available to export.');
         return;
      }
      exportRowsToCsv(items, 'games');
      toast.success(`Exported ${items.length} games to CSV.`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      if (selectedRows.length === 0) return;
      exportRowsToCsv(selectedRows, 'games-selected');
      toast.success(`Exported ${selectedRows.length} selected games to CSV.`);
   }

   function handleTriggerImportCsv() {
      const inputElement = document.getElementById(CSV_INPUT_ID);
      if (inputElement instanceof HTMLInputElement) {
         inputElement.click();
      }
   }

   function handleImportCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse<CsvGameRow>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const validRows = results.data.filter((row) => Boolean(row.name && row.name.trim().length >= 2));

            if (validRows.length === 0) {
               toast.error('No valid game rows found in CSV (column "name" is required).');
               event.target.value = '';
               return;
            }

            const defaultEventId = events[0]?.id ?? '';
            if (!defaultEventId && !validRows.every((r) => Boolean(r.event_id?.trim()))) {
               toast.error('Create at least one Event first or include "event_id" in CSV.');
               event.target.value = '';
               return;
            }

            startMutationTransition(async () => {
               try {
                  await Promise.all(
                     validRows.map((row) => {
                        const rawStatus = row.status?.trim().toUpperCase();
                        const resolvedStatus: GameStatus =
                           VALID_STATUSES.find((s) => s === rawStatus) ?? 'PENDING';

                        const rawType = row.game_type?.trim().toUpperCase();
                        const resolvedType: GameType =
                           VALID_GAME_TYPES.find((t) => t === rawType) ?? 'LUCKY_DRAW';

                        const isDevOnly =
                           isSuperAdmin && row.is_dev_only?.trim().toLowerCase() === 'true';

                        return create({
                           game: {
                              name: row.name?.trim() ?? '',
                              event_id: row.event_id?.trim() || defaultEventId,
                              game_type: resolvedType,
                              description: row.description?.trim() || null,
                              status: resolvedStatus,
                              is_dev_only: isDevOnly,
                           },
                        });
                     }),
                  );

                  toast.success(`Imported ${validRows.length} games from CSV.`);
                  fetchGames();
               } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Failed to import CSV.';
                  toast.error(message);
               } finally {
                  event.target.value = '';
               }
            });
         },
         error: (err) => {
            toast.error(`CSV parse error: ${err.message}`);
            event.target.value = '';
         },
      });
   }

   function formatDate(iso: string | null): string {
      if (!iso) return '—';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleDateString();
   }

   return {
      param: {
         caller,
         isSuperAdmin,
         events,
         items,
         total,
         page,
         limit,
         totalPages,
         rangeStart,
         rangeEnd,
         searchInput,
         urlQuery,
         statusFilter,
         gameTypeFilter,
         eventFilter,
         sortBy,
         sortOrder,
         hasActiveFilters,
         isLoading,
         selectedIds,
         isAllSelected,
         openMenuId,
         deleteTarget,
         isBulkDeleteOpen,
         isPendingMutation,
         csvInputId: CSV_INPUT_ID,
      },
      func: {
         setSearchInput,
         handleStatusChange,
         handleGameTypeChange,
         handleEventFilterChange,
         handleSortFieldChange,
         handleToggleSortOrder,
         handlePageChange,
         handleLimitChange,
         handleClearSearch,
         handleClearAllFilters,
         handleToggleSelectAll,
         handleToggleSelectRow,
         handleToggleRowMenu,
         handleCloseRowMenu,
         handleNavigateCreate,
         handleNavigateEdit,
         handleDuplicateRow,
         handlePromptDelete,
         handleCancelDelete,
         handleConfirmDelete,
         handleBulkStatusChange,
         handleOpenBulkDelete,
         handleCancelBulkDelete,
         handleConfirmBulkDelete,
         handleExportAllCsv,
         handleBulkExportCsv,
         handleTriggerImportCsv,
         handleImportCsvFile,
         formatDate,
         clearSelection: () => setSelectedIds([]),
      },
   };
}

