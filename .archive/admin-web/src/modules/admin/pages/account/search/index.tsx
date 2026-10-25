'use client';

import { Suspense } from 'react';
import { Users } from 'lucide-react';
import { Toaster } from 'sonner';

import {
   ConfirmDeleteModal,
   DataTable,
   SearchBulkBar,
   SearchPageHeader,
   SearchPresetTabs,
   SearchToolbar,
} from '@/components/search';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type {
   BulkActionItem,
   DataTableColumn,
   PresetTabOption,
   ToolbarActiveChip,
   ToolbarFilterSelect,
   ToolbarSelectOption,
} from '@/components/search';
import type { AccountWithCompany } from '@/modules/admin/services/account/get-all/type';
import type { RoleFilter } from './use-logic';

const SUPER_ADMIN_TABS: ReadonlyArray<PresetTabOption<RoleFilter>> = [
   { label: 'All Accounts', value: 'ALL' },
   { label: 'Super Admin', value: 'SUPER_ADMIN' },
   { label: 'Admin', value: 'ADMIN' },
   { label: 'Field Staff', value: 'FIELD_STAFF' },
   { label: 'Guard', value: 'GUARD' },
];

const ADMIN_TABS: ReadonlyArray<PresetTabOption<RoleFilter>> = [
   { label: 'All Staff Accounts', value: 'ALL' },
   { label: 'Field Staff', value: 'FIELD_STAFF' },
   { label: 'Guard', value: 'GUARD' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Status: All', value: 'ALL' },
   { label: 'Status: Active', value: 'ACTIVE' },
   { label: 'Status: Inactive', value: 'INACTIVE' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Created Date', value: 'created_at' },
   { label: 'Sort: Updated Date', value: 'updated_at' },
   { label: 'Sort: Full Name', value: 'full_name' },
   { label: 'Sort: Email', value: 'email' },
   { label: 'Sort: Role', value: 'role' },
];

const PageAdminAccountSearchContent = () => {
   const { param, func } = useLogic();
   const { wrapper, cell, iconLg } = useStyle;

   const presetTabs = param.isSuperAdmin ? SUPER_ADMIN_TABS : ADMIN_TABS;

   const companyFilterOptions: ToolbarSelectOption[] = [
      { label: 'Company: All', value: 'ALL' },
      ...param.companies.map((company) => ({
         label: `Company: ${company.name}`,
         value: company.id,
      })),
   ];

   const toolbarFilters: ToolbarFilterSelect[] = [
      {
         key: 'status',
         ariaLabel: 'Filter by active status',
         value: param.statusFilter,
         options: STATUS_FILTER_OPTIONS,
         onChange: func.handleStatusChange,
      },
   ];

   if (param.isSuperAdmin && param.companies.length > 0) {
      toolbarFilters.push({
         key: 'company',
         ariaLabel: 'Filter by company',
         value: param.companyFilter,
         options: companyFilterOptions,
         onChange: func.handleCompanyFilterChange,
      });
   }

   const activeChips: ToolbarActiveChip[] = [];
   if (param.urlQuery) {
      activeChips.push({
         key: 'search',
         label: `Search: "${param.urlQuery}"`,
         onRemove: func.handleClearSearch,
      });
   }
   if (param.roleFilter !== 'ALL') {
      activeChips.push({
         key: 'role',
         label: `Role: ${param.roleFilter}`,
         onRemove: () => func.handleRoleChange('ALL'),
      });
   }
   if (param.statusFilter !== 'ALL') {
      activeChips.push({
         key: 'status',
         label: `Status: ${param.statusFilter}`,
         onRemove: () => func.handleStatusChange('ALL'),
      });
   }
   if (param.companyFilter !== 'ALL') {
      const matchedCompany = param.companies.find((c) => c.id === param.companyFilter);
      activeChips.push({
         key: 'company',
         label: `Company: ${matchedCompany?.name ?? param.companyFilter}`,
         onRemove: () => func.handleCompanyFilterChange('ALL'),
      });
   }

   const bulkActions: ReadonlyArray<BulkActionItem> = [
      {
         key: 'activate',
         label: 'Set Active',
         onClick: () => func.handleBulkActiveChange(true),
      },
      {
         key: 'deactivate',
         label: 'Set Inactive',
         onClick: () => func.handleBulkActiveChange(false),
      },
   ];

   const columns: ReadonlyArray<DataTableColumn<AccountWithCompany>> = [
      {
         key: 'account',
         header: 'Account',
         renderCell: (account) => (
            <div className={cell.accountWrapper()}>
               <button
                  type="button"
                  onClick={() => func.handleNavigateEdit(account.id)}
                  className={cell.accountNameBtn()}
               >
                  {account.full_name}
               </button>
               <span className={cell.accountSub()}>{account.email}</span>
            </div>
         ),
      },
      {
         key: 'username',
         header: 'Username / Phone',
         renderCell: (account) => (
            <div className={cell.accountWrapper()}>
               <span>{account.username ? `@${account.username}` : '—'}</span>
               <span className={cell.accountSub()}>{account.phone || 'No phone'}</span>
            </div>
         ),
      },
      {
         key: 'role',
         header: 'Role',
         renderCell: (account) => <span className={cell.roleBadge({ role: account.role })}>{account.role}</span>,
      },
      {
         key: 'company',
         header: 'Company',
         renderCell: (account) => account.companies?.name || (account.role === 'SUPER_ADMIN' ? 'Global' : '—'),
      },
      {
         key: 'status',
         header: 'Status',
         renderCell: (account) => {
            const isActive = account.is_active !== false;
            return <span className={cell.statusBadge({ active: isActive })}>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>;
         },
      },
      {
         key: 'created_at',
         header: 'Created',
         renderCell: (account) => func.formatDate(account.created_at),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Accounts"
            subtitle="Manage administrator, field staff, and security guard credentials across your organization."
            createLabel="Create Account"
            csvInputId={param.csvInputId}
            isMutating={param.isPendingMutation}
            isExportDisabled={param.isLoading || param.items.length === 0}
            onImportCsvChange={func.handleImportCsvFile}
            onTriggerImportCsv={func.handleTriggerImportCsv}
            onExportCsv={func.handleExportAllCsv}
            onCreate={func.handleNavigateCreate}
         />

         <SearchPresetTabs
            tabs={presetTabs}
            activeValue={param.roleFilter}
            ariaLabel="Account role presets"
            onChange={func.handleRoleChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by full name, email, username, or phone..."
            onSearchChange={func.setSearchInput}
            onClearSearch={func.handleClearSearch}
            filters={toolbarFilters}
            sortBy={param.sortBy}
            sortOptions={SORT_FIELD_OPTIONS}
            sortOrder={param.sortOrder}
            onSortFieldChange={func.handleSortFieldChange}
            onToggleSortOrder={func.handleToggleSortOrder}
            activeChips={activeChips}
            onClearAllFilters={func.handleClearAllFilters}
         />

         <SearchBulkBar
            selectedCount={param.selectedIds.length}
            isMutating={param.isPendingMutation}
            actions={bulkActions}
            onClearSelection={func.clearSelection}
            onExportSelected={func.handleBulkExportCsv}
            onDeleteSelected={func.handleOpenBulkDelete}
         />

         <DataTable
            columns={columns}
            items={param.items}
            isLoading={param.isLoading}
            getRowId={(account) => account.id}
            getRowLabel={(account) => account.full_name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(account) => func.handleNavigateEdit(account.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Users className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No accounts match your active filters',
               filteredDescription: 'Try adjusting your search keywords or clearing active role and status filters.',
               emptyTitle: 'No accounts created yet',
               emptyDescription:
                  'Create credentials for your event managers, on-site field staff, and check-in guards.',
               createLabel: 'Create First Account',
               onClearFilters: func.handleClearAllFilters,
               onCreateFirst: func.handleNavigateCreate,
            }}
            pagination={{
               page: param.page,
               limit: param.limit,
               total: param.total,
               totalPages: param.totalPages,
               rangeStart: param.rangeStart,
               rangeEnd: param.rangeEnd,
               onPageChange: func.handlePageChange,
               onLimitChange: func.handleLimitChange,
            }}
         />

         <ConfirmDeleteModal
            isOpen={Boolean(param.deleteTarget)}
            title={param.deleteTarget ? `Delete "${param.deleteTarget.full_name}"?` : 'Delete Account?'}
            entityName={param.deleteTarget?.full_name ?? ''}
            descriptionSuffix="This user will immediately lose access to the platform. This action cannot be undone."
            confirmLabel="Delete Account"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected accounts?`}
            entityName={`${param.selectedIds.length} accounts`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};

export const PageAdminAccountSearch: Router_Page = () => (
   <Suspense fallback={null}>
      <PageAdminAccountSearchContent />
   </Suspense>
);
