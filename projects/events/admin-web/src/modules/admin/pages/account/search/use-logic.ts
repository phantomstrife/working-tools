import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/account/get-context';
import { getAll } from '@/modules/admin/services/account/get-all';
import { create } from '@/modules/admin/services/account/create';
import { update } from '@/modules/admin/services/account/update';
import { deleteById } from '@/modules/admin/services/account/delete-by-id';

import type {
   AccountRole,
   AccountSortField,
   AccountStatusFilter,
   AccountWithCompany,
   SortOrder,
} from '@/modules/admin/services/account/get-all/type';
import type { CallerAccount, CompanyOption } from '@/modules/admin/services/account/get-context/type';

export type RoleFilter = AccountRole | 'ALL';

export interface CsvAccountRow {
   full_name?: string;
   email?: string;
   username?: string;
   phone?: string;
   role?: string;
   password?: string;
   company_id?: string;
   is_active?: string;
}

const VALID_ROLES: ReadonlyArray<AccountRole> = ['SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD'];
const VALID_SORT_FIELDS: ReadonlyArray<AccountSortField> = [
   'full_name',
   'email',
   'role',
   'created_at',
   'updated_at',
];
const CSV_INPUT_ID = 'account-csv-upload-input';

function parseRoleFilter(value: string | null): RoleFilter {
   if (value === 'SUPER_ADMIN' || value === 'ADMIN' || value === 'FIELD_STAFF' || value === 'GUARD') {
      return value;
   }
   return 'ALL';
}

function parseStatusFilter(value: string | null): AccountStatusFilter {
   if (value === 'ACTIVE' || value === 'INACTIVE') {
      return value;
   }
   return 'ALL';
}

function parseSortField(value: string | null): AccountSortField {
   if (
      value === 'full_name' ||
      value === 'email' ||
      value === 'role' ||
      value === 'created_at' ||
      value === 'updated_at'
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

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlQuery = searchParams?.get('q') ?? '';
   const roleFilter = parseRoleFilter(searchParams?.get('role') ?? null);
   const statusFilter = parseStatusFilter(searchParams?.get('status') ?? null);
   const companyFilter = searchParams?.get('companyId') ?? 'ALL';
   const sortBy = parseSortField(searchParams?.get('sortBy') ?? null);
   const sortOrder = parseSortOrder(searchParams?.get('sortOrder') ?? null);
   const page = parsePositiveInt(searchParams?.get('page') ?? null, 1);
   const limit = parsePositiveInt(searchParams?.get('limit') ?? null, 20);

   const [searchInput, setSearchInput] = useState<string>(urlQuery);
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [companies, setCompanies] = useState<CompanyOption[]>([]);
   const [items, setItems] = useState<AccountWithCompany[]>([]);
   const [total, setTotal] = useState<number>(0);
   const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);

   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AccountWithCompany | null>(null);
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
            // Context load errors are non-blocking; server actions still enforce RBAC
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

   const fetchAccounts = useCallback(() => {
      startFetchTransition(async () => {
         try {
            const response = await getAll({
               search: urlQuery,
               role: roleFilter,
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
            const message = err instanceof Error ? err.message : 'Failed to load accounts.';
            toast.error(message);
         } finally {
            setHasLoadedOnce(true);
         }
      });
   }, [companyFilter, limit, page, roleFilter, sortBy, sortOrder, statusFilter, urlQuery]);

   useEffect(() => {
      fetchAccounts();
   }, [fetchAccounts]);

   const totalPages = Math.max(1, Math.ceil(total / limit));
   const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
   const rangeEnd = Math.min(total, page * limit);
   const hasActiveFilters = Boolean(
      urlQuery.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL' || companyFilter !== 'ALL',
   );
   const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

   function handleRoleChange(nextRole: RoleFilter) {
      updateUrlParams({
         role: nextRole === 'ALL' ? null : nextRole,
         page: '1',
      });
   }

   function handleStatusChange(nextStatus: string) {
      const parsed = parseStatusFilter(nextStatus);
      updateUrlParams({
         status: parsed === 'ALL' ? null : parsed,
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
         role: null,
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
      router.push(ROUTE.ADMIN.ACCOUNT.CREATE);
   }

   function handleNavigateEdit(id: string) {
      setOpenMenuId(null);
      router.push(ROUTE.ADMIN.ACCOUNT.UPDATE(id));
   }

   function handleDuplicateRow(account: AccountWithCompany) {
      setOpenMenuId(null);
      router.push(`${ROUTE.ADMIN.ACCOUNT.CREATE}?duplicateId=${encodeURIComponent(account.id)}`);
   }

   function handlePromptDelete(account: AccountWithCompany) {
      setOpenMenuId(null);
      setDeleteTarget(account);
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
            toast.success(`Deleted account "${target.full_name}" successfully.`);
            fetchAccounts();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete account.';
            toast.error(message);
         }
      });
   }

   function handleBulkActiveChange(nextActive: boolean) {
      if (selectedIds.length === 0) return;

      startMutationTransition(async () => {
         try {
            const now = new Date().toISOString();
            await Promise.all(
               selectedIds.map((id) =>
                  update({
                     id,
                     account: { is_active: nextActive, updated_at: now },
                  }),
               ),
            );
            toast.success(
               `${nextActive ? 'Activated' : 'Deactivated'} ${selectedIds.length} selected accounts.`,
            );
            setSelectedIds([]);
            fetchAccounts();
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
            toast.success(`Deleted ${count} selected accounts.`);
            fetchAccounts();
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk delete failed.';
            toast.error(message);
         }
      });
   }

   function exportRowsToCsv(rows: AccountWithCompany[], filenamePrefix: string) {
      const csvData = rows.map((row) => ({
         id: row.id,
         full_name: row.full_name,
         email: row.email,
         username: row.username ?? '',
         phone: row.phone ?? '',
         role: row.role,
         company_id: row.company_id ?? '',
         company_name: row.companies?.name ?? '',
         is_active: row.is_active ? 'true' : 'false',
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
      exportRowsToCsv(items, 'accounts');
      toast.success(`Exported ${items.length} accounts to CSV.`);
   }

   function handleBulkExportCsv() {
      const selectedRows = items.filter((item) => selectedIds.includes(item.id));
      if (selectedRows.length === 0) return;
      exportRowsToCsv(selectedRows, 'accounts-selected');
      toast.success(`Exported ${selectedRows.length} selected accounts to CSV.`);
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

      Papa.parse<CsvAccountRow>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const validRows = results.data.filter((row) =>
               Boolean(
                  row.full_name &&
                     row.full_name.trim().length >= 2 &&
                     row.email &&
                     row.email.trim() &&
                     row.password &&
                     row.password.trim().length >= 6,
               ),
            );

            if (validRows.length === 0) {
               toast.error(
                  'No valid account rows found in CSV ("full_name", "email" and "password" (min 6 chars) are required).',
               );
               event.target.value = '';
               return;
            }

            startMutationTransition(async () => {
               try {
                  await Promise.all(
                     validRows.map((row) => {
                        const rawRole = row.role?.trim().toUpperCase();
                        const defaultRole: AccountRole = 'FIELD_STAFF';
                        const resolvedRole: AccountRole =
                           VALID_ROLES.find((r) => r === rawRole) ?? defaultRole;

                        const isActive =
                           row.is_active?.trim().toLowerCase() === 'false' ? false : true;

                        return create({
                           account: {
                              full_name: row.full_name?.trim() ?? '',
                              email: row.email?.trim() ?? '',
                              username: row.username?.trim() || null,
                              phone: row.phone?.trim() || null,
                              role: isSuperAdmin
                                 ? resolvedRole
                                 : resolvedRole === 'GUARD'
                                   ? 'GUARD'
                                   : 'FIELD_STAFF',
                              company_id: isSuperAdmin
                                 ? row.company_id?.trim() || caller?.company_id || null
                                 : caller?.company_id ?? null,
                              is_active: isActive,
                           },
                           password: row.password?.trim() ?? '',
                        });
                     }),
                  );

                  toast.success(`Imported ${validRows.length} accounts from CSV.`);
                  fetchAccounts();
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
         roleFilter,
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
         handleRoleChange,
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
         handleBulkActiveChange,
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

