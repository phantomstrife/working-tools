import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { create } from '@/modules/admin/services/lucky-draw/prize/create';
import { deleteById } from '@/modules/admin/services/lucky-draw/prize/delete-by-id';
import { getAll } from '@/modules/admin/services/lucky-draw/prize/get-all';
import { getContext } from '@/modules/admin/services/lucky-draw/prize/get-context';

import type { PrizeWithRelations } from '@/modules/admin/services/lucky-draw/prize/get-all/type';
import type { GameOption } from '@/modules/admin/services/lucky-draw/prize/get-context/type';

export type StockFilter = 'ALL' | 'IN_STOCK' | 'DEPLETED';
export type SortField = 'tier_order' | 'name' | 'total_quantity' | 'remaining_quantity' | 'created_at';
export type SortOrder = 'asc' | 'desc';

const CSV_INPUT_ID = 'lucky-draw-prize-csv-upload-input';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams.get('q') ?? '';
   const rawStock = searchParams.get('stock');
   const stockFilter: StockFilter =
      rawStock === 'IN_STOCK' || rawStock === 'DEPLETED' ? rawStock : 'ALL';

   const rawGame = searchParams.get('game');
   const gameFilter = rawGame ?? 'ALL';

   const rawSortBy = searchParams.get('sortBy');
   const sortBy: SortField =
      rawSortBy === 'name' ||
      rawSortBy === 'total_quantity' ||
      rawSortBy === 'remaining_quantity' ||
      rawSortBy === 'created_at'
         ? rawSortBy
         : 'tier_order';

   const rawSortOrder = searchParams.get('sortOrder');
   const sortOrder: SortOrder = rawSortOrder === 'desc' ? 'desc' : 'asc';

   const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
   const limit = Math.max(5, Number(searchParams.get('limit') ?? '20') || 20);

   const [searchInput, setSearchInput] = useState(urlQuery);
   const [items, setItems] = useState<PrizeWithRelations[]>([]);
   const [total, setTotal] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [games, setGames] = useState<GameOption[]>([]);

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<PrizeWithRelations | null>(null);
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

   const fetchPrizes = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await getAll({
            search: urlQuery,
            stockStatus: stockFilter,
            gameId: gameFilter,
            sortBy,
            sortOrder,
            page,
            limit,
         });
         setItems(response.items);
         setTotal(response.total);
         setSelectedIds([]);
      } catch (error: unknown) {
         toast.error(error instanceof Error ? error.message : 'Failed to load prizes.');
      } finally {
         setIsLoading(false);
      }
   }, [urlQuery, stockFilter, gameFilter, sortBy, sortOrder, page, limit]);

   useEffect(() => {
      let active = true;
      getAll({
         search: urlQuery,
         stockStatus: stockFilter,
         gameId: gameFilter,
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
            toast.error(error instanceof Error ? error.message : 'Failed to load prizes.');
         })
         .finally(() => {
            if (active) {
               setIsLoading(false);
            }
         });

      return () => {
         active = false;
      };
   }, [urlQuery, stockFilter, gameFilter, sortBy, sortOrder, page, limit]);

   function handleStockChange(nextStock: StockFilter) {
      setIsLoading(true);
      updateUrl({ stock: nextStock === 'ALL' ? null : nextStock, page: '1' });
   }

   function handleGameFilterChange(nextGameId: string) {
      setIsLoading(true);
      updateUrl({ game: nextGameId === 'ALL' ? null : nextGameId, page: '1' });
   }

   function handleSortFieldChange(value: string) {
      if (
         value === 'tier_order' ||
         value === 'name' ||
         value === 'total_quantity' ||
         value === 'remaining_quantity' ||
         value === 'created_at'
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
      updateUrl({ q: null, stock: null, game: null, page: '1' });
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
      router.push(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.UPDATE(id));
   }

   function handleToggleRowMenu(id: string) {
      setOpenMenuId((prev) => (prev === id ? null : id));
   }

   function handleCloseRowMenu() {
      setOpenMenuId(null);
   }

   function handleDuplicateRow(prizeItem: PrizeWithRelations) {
      setOpenMenuId(null);
      startMutationTransition(async () => {
         try {
            await create({
               prize: {
                  game_id: prizeItem.game_id,
                  name: `${prizeItem.name} (Copy)`,
                  description: prizeItem.description,
                  image_url: prizeItem.image_url,
                  tier_order: prizeItem.tier_order,
                  total_quantity: prizeItem.total_quantity,
                  remaining_quantity: prizeItem.total_quantity,
               },
            });
            toast.success(`Duplicated "${prizeItem.name}".`);
            await fetchPrizes();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to duplicate prize.');
         }
      });
   }

   function handlePromptDelete(prizeItem: PrizeWithRelations) {
      setOpenMenuId(null);
      setDeleteTarget(prizeItem);
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
            toast.success(`Deleted "${target.name}".`);
            setDeleteTarget(null);
            await fetchPrizes();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete prize.');
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
            toast.success(`Deleted ${selectedIds.length} prizes.`);
            setIsBulkDeleteOpen(false);
            await fetchPrizes();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete selected prizes.');
         }
      });
   }

   function exportRowsToCsv(rows: PrizeWithRelations[], filename: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         game_id: row.game_id,
         game_name: row.games?.name ?? '',
         event_name: row.games?.events?.name ?? '',
         tier_order: row.tier_order,
         name: row.name,
         description: row.description ?? '',
         total_quantity: row.total_quantity,
         remaining_quantity: row.remaining_quantity,
         image_url: row.image_url ?? '',
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
      toast.success(`Exported ${rows.length} prizes to CSV.`);
   }

   function handleExportAllCsv() {
      exportRowsToCsv(items, `lucky-draw-prizes-${new Date().toISOString().slice(0, 10)}.csv`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      exportRowsToCsv(selectedRows, `lucky-draw-prizes-selected-${new Date().toISOString().slice(0, 10)}.csv`);
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
               let importedCount = 0;
               try {
                  for (const row of rows) {
                     const name = (row.name ?? row.Name ?? '').trim();
                     if (!name) continue;
                     const targetGameId = (row.game_id ?? '').trim() || fallbackGameId;
                     if (!targetGameId) {
                        throw new Error('Please select or create a Lucky Draw game before importing prizes.');
                     }
                     const tierOrder = Math.max(1, Number(row.tier_order ?? '1') || 1);
                     const totalQuantity = Math.max(1, Number(row.total_quantity ?? '1') || 1);
                     const remainingQuantity = Math.min(
                        totalQuantity,
                        Math.max(0, Number(row.remaining_quantity ?? String(totalQuantity)) || totalQuantity),
                     );
                     await create({
                        prize: {
                           game_id: targetGameId,
                           name,
                           description: (row.description ?? '').trim() || null,
                           image_url: (row.image_url ?? '').trim() || null,
                           tier_order: tierOrder,
                           total_quantity: totalQuantity,
                           remaining_quantity: remainingQuantity,
                        },
                     });
                     importedCount += 1;
                  }
                  toast.success(`Imported ${importedCount} prizes from CSV.`);
                  await fetchPrizes();
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
   const hasActiveFilters = Boolean(urlQuery || stockFilter !== 'ALL' || gameFilter !== 'ALL');

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
         stockFilter,
         gameFilter,
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
         handleStockChange,
         handleGameFilterChange,
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
