import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/event/get-context';
import { getAll } from '@/modules/admin/services/event/get-all';
import { create } from '@/modules/admin/services/event/create';
import { update } from '@/modules/admin/services/event/update';
import { deleteById } from '@/modules/admin/services/event/delete-by-id';

import type {
   EventSortField,
   EventStatus,
   EventWithCompany,
   SortOrder,
} from '@/modules/admin/services/event/get-all/type';
import type { CallerAccount, CompanyOption } from '@/modules/admin/services/event/get-context/type';

export type StatusFilter = EventStatus | 'ALL';

export interface CsvEventRow {
   name?: string;
   slug?: string;
   company_id?: string;
   description?: string;
   location_name?: string;
   location_address?: string;
   start_time?: string;
   end_time?: string;
   banner_url?: string;
   status?: string;
}

const VALID_STATUSES: ReadonlyArray<EventStatus> = ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
const VALID_SORT_FIELDS: ReadonlyArray<EventSortField> = [
   'name',
   'start_time',
   'created_at',
   'updated_at',
   'status',
];
const CSV_INPUT_ID = 'event-csv-upload-input';

function parseStatusFilter(value: string | null): StatusFilter {
   if (
      value === 'DRAFT' ||
      value === 'UPCOMING' ||
      value === 'ONGOING' ||
      value === 'COMPLETED' ||
      value === 'CANCELLED'
   ) {
      return value;
   }
   return 'ALL';
}

function parseSortField(value: string | null): EventSortField {
   if (
      value === 'name' ||
      value === 'start_time' ||
      value === 'created_at' ||
      value === 'updated_at' ||
      value === 'status'
   ) {
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

function toSlug(input: string): string {
   return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
}

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams?.get('q') ?? '';
   const statusFilter = parseStatusFilter(searchParams?.get('status') ?? null);
   const companyFilter = searchParams?.get('companyId') ?? 'ALL';
   const sortBy = parseSortField(searchParams?.get('sortBy') ?? null);
   const sortOrder = parseSortOrder(searchParams?.get('sortOrder') ?? null);
   const page = parsePositiveInt(searchParams?.get('page') ?? null, 1);
   const limit = parsePositiveInt(searchParams?.get('limit') ?? null, 20);

   const [searchInput, setSearchInput] = useState<string>(urlQuery);
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [companies, setCompanies] = useState<CompanyOption[]>([]);
   const [items, setItems] = useState<EventWithCompany[]>([]);
   const [total, setTotal] = useState<number>(0);
   const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<EventWithCompany | null>(null);
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
            setCompanies(res.companies);
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

   const fetchEvents = useCallback(() => {
      startFetchTransition(async () => {
         try {
            const response = await getAll({
               search: urlQuery,
               status: statusFilter,
               companyId: companyFilter,
               page,
               limit,
               sortBy,
               sortOrder,
            });

            setItems(response.items);
            setTotal(response.total);
            setSelectedIds((prev) => prev.filter((id) => response.items.some((item) => item.id === id)));
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load events.';
            toast.error(message);
         } finally {
            setHasLoadedOnce(true);
         }
      });
   }, [companyFilter, limit, page, sortBy, sortOrder, statusFilter, urlQuery]);

   useEffect(() => {
      fetchEvents();
   }, [fetchEvents]);

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const hasActiveFilters = Boolean(
      urlQuery.trim() || statusFilter !== 'ALL' || companyFilter !== 'ALL',
   );
   const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

   function handleStatusChange(nextStatus: StatusFilter) {
      updateUrlParams({
         status: nextStatus === 'ALL' ? null : nextStatus,
         page: '1',
      });
   }

   function handleCompanyFilterChange(nextCompanyId: string) {
      updateUrlParams({
         companyId: nextCompanyId === 'ALL' ? null : nextCompanyId,
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
         companyId: null,
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
      router.push(ROUTE.ADMIN.EVENT.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.EVENT.UPDATE(id));
   }

   function handleDuplicateRow(eventItem: EventWithCompany) {
      setOpenMenuId(null);
      router.push(`${ROUTE.ADMIN.EVENT.CREATE}?duplicateId=${encodeURIComponent(eventItem.id)}`);
   }

   function handlePromptDelete(eventItem: EventWithCompany) {
      setOpenMenuId(null);
      setDeleteTarget(eventItem);
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
            toast.success(`Deleted event "${target.name}" successfully.`);
            fetchEvents();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete event.';
            toast.error(message);
         }
      });
   }

   function handleBulkStatusChange(nextStatus: EventStatus) {
      if (selectedIds.length === 0) return;

      startMutationTransition(async () => {
         try {
            const now = new Date().toISOString();
            await Promise.all(
               selectedIds.map((id) =>
                  update({
                     id,
                     event: { status: nextStatus, updated_at: now },
                  }),
               ),
            );
            toast.success(`Updated status to ${nextStatus} for ${selectedIds.length} events.`);
            setSelectedIds([]);
            fetchEvents();
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
            toast.success(`Deleted ${count} selected events.`);
            fetchEvents();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk delete failed.';
            toast.error(message);
         }
      });
   }

   function exportRowsToCsv(rows: EventWithCompany[], filenamePrefix: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         name: row.name,
         slug: row.slug,
         company_id: row.company_id,
         company_name: row.companies?.name ?? '',
         description: row.description ?? '',
         location_name: row.location_name ?? '',
         location_address: row.location_address ?? '',
         start_time: row.start_time ?? '',
         end_time: row.end_time ?? '',
         banner_url: row.banner_url ?? '',
         status: row.status ?? 'DRAFT',
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
      exportRowsToCsv(items, 'events');
      toast.success(`Exported ${items.length} events to CSV.`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      if (selectedRows.length === 0) return;
      exportRowsToCsv(selectedRows, 'events-selected');
      toast.success(`Exported ${selectedRows.length} selected events to CSV.`);
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

      Papa.parse<CsvEventRow>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const validRows = results.data.filter((row) => Boolean(row.name && row.name.trim().length >= 2));

            if (validRows.length === 0) {
               toast.error('No valid event rows found in CSV (column "name" is required).');
               event.target.value = '';
               return;
            }

            startMutationTransition(async () => {
               try {
                  await Promise.all(
                     validRows.map((row, index) => {
                        const rawStatus = row.status?.trim().toUpperCase();
                        const resolvedStatus: EventStatus =
                           VALID_STATUSES.find((s) => s === rawStatus) ?? 'DRAFT';
                        const name = row.name?.trim() ?? '';
                        const generatedSlug = `${toSlug(row.slug?.trim() || name)}-${Date.now()}-${index}`;
                        const fallbackCompanyId = caller?.company_id ?? companies[0]?.id ?? '';

                        return create({
                           event: {
                              name,
                              slug: generatedSlug,
                              company_id: isSuperAdmin
                                 ? row.company_id?.trim() || fallbackCompanyId
                                 : (caller?.company_id ?? fallbackCompanyId),
                              description: row.description?.trim() || null,
                              location_name: row.location_name?.trim() || null,
                              location_address: row.location_address?.trim() || null,
                              start_time: row.start_time?.trim() || null,
                              end_time: row.end_time?.trim() || null,
                              banner_url: row.banner_url?.trim() || null,
                              status: resolvedStatus,
                           },
                        });
                     }),
                  );

                  toast.success(`Imported ${validRows.length} events from CSV.`);
                  fetchEvents();
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

   function formatSchedule(startIso: string | null, endIso: string | null): string {
      if (!startIso && !endIso) return 'Unscheduled';
      const startText = startIso ? formatDate(startIso) : 'TBD';
      const endText = endIso ? formatDate(endIso) : '';
      return endText && endText !== startText ? `${startText} → ${endText}` : startText;
   }

   return {
      param: {
         caller,
         isSuperAdmin,
         companies,
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
         companyFilter,
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
         handleCompanyFilterChange,
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
         formatSchedule,
         clearSelection: () => setSelectedIds([]),
      },
   };
}

