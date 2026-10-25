import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getAll } from '@/modules/admin/services/company/get-all';
import { create } from '@/modules/admin/services/company/create';
import { update } from '@/modules/admin/services/company/update';
import { deleteById } from '@/modules/admin/services/company/delete-by-id';

import type {
   CompanyRow,
   CompanySortField,
   CompanyStatus,
   SortOrder,
} from '@/modules/admin/services/company/get-all/type';

export type StatusFilter = CompanyStatus | 'ALL';

export interface CsvCompanyRow {
   name?: string;
   tax_code?: string;
   industry?: string;
   address?: string;
   contact_person?: string;
   contact_email?: string;
   contact_phone?: string;
   status?: string;
}

const VALID_STATUSES: ReadonlyArray<CompanyStatus> = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const VALID_SORT_FIELDS: ReadonlyArray<CompanySortField> = ['name', 'created_at', 'updated_at', 'status'];
const CSV_INPUT_ID = 'company-csv-upload-input';

function parseStatusFilter(value: string | null): StatusFilter {
   if (value === 'ACTIVE' || value === 'INACTIVE' || value === 'SUSPENDED') {
      return value;
   }
   return 'ALL';
}

function parseSortField(value: string | null): CompanySortField {
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
   const sortBy = parseSortField(searchParams?.get('sortBy') ?? null);
   const sortOrder = parseSortOrder(searchParams?.get('sortOrder') ?? null);
   const page = parsePositiveInt(searchParams?.get('page') ?? null, 1);
   const limit = parsePositiveInt(searchParams?.get('limit') ?? null, 20);

   const [searchInput, setSearchInput] = useState<string>(urlQuery);
   const [items, setItems] = useState<CompanyRow[]>([]);
   const [total, setTotal] = useState<number>(0);
   const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
   const [error, setError] = useState<string>('');

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<CompanyRow | null>(null);
   const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false);

   const [isFetching, startFetchTransition] = useTransition();
   const [isPendingMutation, startMutationTransition] = useTransition();

   const isLoading = !hasLoadedOnce || isFetching;

   const updateUrlParams = useCallback(
      (updates: Record<string, string | null>) => {
         const params = new URLSearchParams(searchParams?.toString() ?? '');

         Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === '' || (key === 'status' && val === 'ALL')) {
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
      const timer = window.setTimeout(() => {
         if (searchInput !== urlQuery) {
            updateUrlParams({ q: searchInput.trim() || null, page: '1' });
         }
      }, 350);

      return () => {
         window.clearTimeout(timer);
      };
   }, [searchInput, updateUrlParams, urlQuery]);

   const fetchCompanies = useCallback(() => {
      startFetchTransition(async () => {
         try {
            const response = await getAll({
               search: urlQuery,
               status: statusFilter,
               page,
               limit,
               sortBy,
               sortOrder,
            });

            setError('');
            setItems(response.items);
            setTotal(response.total);
            setSelectedIds((prev) => prev.filter((id) => response.items.some((item) => item.id === id)));
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load companies.';
            setError(message);
            toast.error(message);
         } finally {
            setHasLoadedOnce(true);
         }
      });
   }, [limit, page, sortBy, sortOrder, statusFilter, urlQuery]);

   useEffect(() => {
      fetchCompanies();
   }, [fetchCompanies]);

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const hasActiveFilters = Boolean(urlQuery.trim() || statusFilter !== 'ALL');
   const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

   function handleStatusChange(nextStatus: StatusFilter) {
      updateUrlParams({
         status: nextStatus === 'ALL' ? null : nextStatus,
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
      router.push(ROUTE.ADMIN.COMPANY.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.COMPANY.UPDATE(id));
   }

   function handleDuplicateRow(company: CompanyRow) {
      setOpenMenuId(null);
      router.push(`${ROUTE.ADMIN.COMPANY.CREATE}?duplicateId=${encodeURIComponent(company.id)}`);
   }

   function handlePromptDelete(company: CompanyRow) {
      setOpenMenuId(null);
      setDeleteTarget(company);
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
            toast.success(`Deleted "${target.name}" successfully.`);
            fetchCompanies();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete company.';
            toast.error(message);
         }
      });
   }

   function handleBulkStatusChange(nextStatus: CompanyStatus) {
      if (selectedIds.length === 0) return;

      startMutationTransition(async () => {
         try {
            const now = new Date().toISOString();
            await Promise.all(
               selectedIds.map((id) =>
                  update({
                     id,
                     company: { status: nextStatus, updated_at: now },
                  }),
               ),
            );
            toast.success(`Updated status to ${nextStatus} for ${selectedIds.length} companies.`);
            setSelectedIds([]);
            fetchCompanies();
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
            toast.success(`Deleted ${count} selected companies.`);
            fetchCompanies();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk delete failed.';
            toast.error(message);
         }
      });
   }

   function exportRowsToCsv(rows: CompanyRow[], filenamePrefix: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         name: row.name,
         tax_code: row.tax_code ?? '',
         industry: row.industry ?? '',
         address: row.address ?? '',
         contact_person: row.contact_person ?? '',
         contact_email: row.contact_email ?? '',
         contact_phone: row.contact_phone ?? '',
         status: row.status ?? 'ACTIVE',
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
      exportRowsToCsv(items, 'companies');
      toast.success(`Exported ${items.length} companies to CSV.`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      if (selectedRows.length === 0) return;
      exportRowsToCsv(selectedRows, 'companies-selected');
      toast.success(`Exported ${selectedRows.length} selected companies to CSV.`);
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

      Papa.parse<CsvCompanyRow>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const validRows = results.data.filter((row) => Boolean(row.name && row.name.trim().length >= 2));

            if (validRows.length === 0) {
               toast.error('No valid company rows found in CSV (column "name" is required).');
               event.target.value = '';
               return;
            }

            startMutationTransition(async () => {
               try {
                  await Promise.all(
                     validRows.map((row) => {
                        const rawStatus = row.status?.trim().toUpperCase();
                        const resolvedStatus: CompanyStatus =
                           VALID_STATUSES.find((s) => s === rawStatus) ?? 'ACTIVE';

                        return create({
                           company: {
                              name: row.name?.trim() ?? '',
                              tax_code: row.tax_code?.trim() || null,
                              industry: row.industry?.trim() || null,
                              address: row.address?.trim() || null,
                              contact_person: row.contact_person?.trim() || null,
                              contact_email: row.contact_email?.trim() || null,
                              contact_phone: row.contact_phone?.trim() || null,
                              status: resolvedStatus,
                           },
                        });
                     }),
                  );

                  toast.success(`Imported ${validRows.length} companies from CSV.`);
                  fetchCompanies();
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
         sortBy,
         sortOrder,
         hasActiveFilters,
         isLoading,
         error,
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

