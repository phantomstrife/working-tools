import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { getAll } from '@/modules/admin/services/lucky-draw/winner/get-all';
import { getContext } from '@/modules/admin/services/lucky-draw/winner/get-context';
import { logExport } from '@/modules/admin/services/lucky-draw/winner/log-export';

import type { WinnerWithRelations } from '@/modules/admin/services/lucky-draw/winner/get-all/type';
import type { GameOption, PrizeOption } from '@/modules/admin/services/lucky-draw/winner/get-context/type';

export type SortOrder = 'asc' | 'desc';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams.get('q') ?? '';
   const rawGame = searchParams.get('game');
   const gameFilter = rawGame ?? 'ALL';

   const rawPrize = searchParams.get('prize');
   const prizeFilter = rawPrize ?? 'ALL';

   const rawSortOrder = searchParams.get('sortOrder');
   const sortOrder: SortOrder = rawSortOrder === 'asc' ? 'asc' : 'desc';

   const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
   const limit = Math.max(5, Number(searchParams.get('limit') ?? '20') || 20);

   const [searchInput, setSearchInput] = useState(urlQuery);
   const [items, setItems] = useState<WinnerWithRelations[]>([]);
   const [total, setTotal] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [games, setGames] = useState<GameOption[]>([]);
   const [prizes, setPrizes] = useState<PrizeOption[]>([]);

   const [isExporting, startExportTransition] = useTransition();

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
            setPrizes(ctx.prizes);
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

   useEffect(() => {
      let active = true;
      getAll({
         search: urlQuery,
         gameId: gameFilter,
         prizeId: prizeFilter,
         sortOrder,
         page,
         limit,
      })
         .then((response) => {
            if (!active) return;
            setItems(response.items);
            setTotal(response.total);
         })
         .catch((error: unknown) => {
            if (!active) return;
            toast.error(error instanceof Error ? error.message : 'Failed to load winners report.');
         })
         .finally(() => {
            if (active) {
               setIsLoading(false);
            }
         });

      return () => {
         active = false;
      };
   }, [urlQuery, gameFilter, prizeFilter, sortOrder, page, limit]);

   function handleGameFilterChange(nextGameId: string) {
      setIsLoading(true);
      updateUrl({
         game: nextGameId === 'ALL' ? null : nextGameId,
         prize: null,
         page: '1',
      });
   }

   function handlePrizeFilterChange(nextPrizeId: string) {
      setIsLoading(true);
      updateUrl({ prize: nextPrizeId === 'ALL' ? null : nextPrizeId, page: '1' });
   }

   function handleToggleSortOrder() {
      setIsLoading(true);
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
   }

   function handlePageChange(nextPage: number) {
      setIsLoading(true);
      updateUrl({ page: String(nextPage) });
   }

   function handleLimitChange(nextLimit: number) {
      setIsLoading(true);
      updateUrl({ limit: String(nextLimit), page: '1' });
   }

   function handleClearSearch() {
      setIsLoading(true);
      setSearchInput('');
      updateUrl({ q: null, page: '1' });
   }

   function handleClearAllFilters() {
      setIsLoading(true);
      setSearchInput('');
      updateUrl({ q: null, game: null, prize: null, page: '1' });
   }

   function handleExportExcel() {
      startExportTransition(async () => {
         try {
            const fullReport = await getAll({
               search: urlQuery,
               gameId: gameFilter,
               prizeId: prizeFilter,
               sortOrder,
               page: 1,
               limit: 5000,
            });

            const rows = fullReport.items;
            const csvData = rows.map((row, index) => ({
               no: index + 1,
               won_at: row.won_at ?? '',
               event_name: row.games?.events?.name ?? '',
               game_name: row.games?.name ?? '',
               prize_tier: row.lucky_draw_prizes?.tier_order ?? '',
               prize_name: row.lucky_draw_prizes?.name ?? '',
               winner_name: row.lucky_draw_attendants?.full_name ?? '',
               ticket_code: row.lucky_draw_attendants?.ticket_code ?? '',
               email: row.lucky_draw_attendants?.email ?? '',
               phone: row.lucky_draw_attendants?.phone ?? '',
               company_name: row.lucky_draw_attendants?.company_name ?? '',
               department: row.lucky_draw_attendants?.department ?? '',
               drawn_by: row.accounts?.full_name ?? row.accounts?.email ?? '',
            }));

            const csvString = `\uFEFF${Papa.unparse(csvData)}`;
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `lucky-draw-winners-report-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            await logExport({
               gameId: gameFilter !== 'ALL' ? gameFilter : null,
               exportedCount: rows.length,
            });

            toast.success(`Exported ${rows.length} winner records to Excel (.csv).`);
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to export winners report.');
         }
      });
   }

   function formatDateTime(iso: string | null) {
      if (!iso) return '—';
      return new Date(iso).toLocaleString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   }

   const filteredPrizes =
      gameFilter !== 'ALL' ? prizes.filter((p) => p.game_id === gameFilter) : prizes;

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const hasActiveFilters = Boolean(urlQuery || gameFilter !== 'ALL' || prizeFilter !== 'ALL');

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
         isExporting,
         searchInput,
         urlQuery,
         gameFilter,
         prizeFilter,
         games,
         filteredPrizes,
         sortOrder,
         hasActiveFilters,
      },
      func: {
         setSearchInput,
         handleGameFilterChange,
         handlePrizeFilterChange,
         handleToggleSortOrder,
         handlePageChange,
         handleLimitChange,
         handleClearSearch,
         handleClearAllFilters,
         handleExportExcel,
         formatDateTime,
      },
   };
}

