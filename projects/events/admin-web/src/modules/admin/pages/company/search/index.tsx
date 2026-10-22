'use client';

import { Building2 } from 'lucide-react';
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
import type { CompanyRow } from '@/modules/admin/services/company/get-all/type';
import type { StatusFilter } from './use-logic';

const PRESET_TABS: ReadonlyArray<PresetTabOption<StatusFilter>> = [
   { label: 'All Companies', value: 'ALL' },
   { label: 'Active', value: 'ACTIVE' },
   { label: 'Inactive', value: 'INACTIVE' },
   { label: 'Suspended', value: 'SUSPENDED' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Status: All', value: 'ALL' },
   { label: 'Status: Active', value: 'ACTIVE' },
   { label: 'Status: Inactive', value: 'INACTIVE' },
   { label: 'Status: Suspended', value: 'SUSPENDED' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Created Date', value: 'created_at' },
   { label: 'Sort: Updated Date', value: 'updated_at' },
   { label: 'Sort: Company Name', value: 'name' },
   { label: 'Sort: Status', value: 'status' },
];

export const PageAdminCompanySearch: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, cell, iconLg } = useStyle;

   const toolbarFilters: ReadonlyArray<ToolbarFilterSelect> = [
      {
         key: 'status',
         ariaLabel: 'Filter by status',
         value: param.statusFilter,
         options: STATUS_FILTER_OPTIONS,
         onChange: (value) =>
            func.handleStatusChange(
               value === 'ACTIVE' || value === 'INACTIVE' || value === 'SUSPENDED' ? value : 'ALL',
            ),
      },
   ];

   const activeChips: ToolbarActiveChip[] = [];
   if (param.urlQuery) {
      activeChips.push({
         key: 'search',
         label: `Search: "${param.urlQuery}"`,
         onRemove: func.handleClearSearch,
      });
   }
   if (param.statusFilter !== 'ALL') {
      activeChips.push({
         key: 'status',
         label: `Status: ${param.statusFilter}`,
         onRemove: () => func.handleStatusChange('ALL'),
      });
   }

   const bulkActions: ReadonlyArray<BulkActionItem> = [
      {
         key: 'active',
         label: 'Set Active',
         onClick: () => func.handleBulkStatusChange('ACTIVE'),
      },
      {
         key: 'inactive',
         label: 'Set Inactive',
         onClick: () => func.handleBulkStatusChange('INACTIVE'),
      },
      {
         key: 'suspended',
         label: 'Set Suspended',
         onClick: () => func.handleBulkStatusChange('SUSPENDED'),
      },
   ];

   const columns: ReadonlyArray<DataTableColumn<CompanyRow>> = [
      {
         key: 'company',
         header: 'Company',
         renderCell: (company) => (
            <div className={cell.companyWrapper()}>
               <button
                  type="button"
                  onClick={() => func.handleNavigateEdit(company.id)}
                  className={cell.companyNameBtn()}
               >
                  {company.name}
               </button>
               <span className={cell.companyMeta()}>{company.address || 'No headquarters address'}</span>
            </div>
         ),
      },
      {
         key: 'tax_code',
         header: 'Tax Code',
         renderCell: (company) => company.tax_code || '—',
      },
      {
         key: 'industry',
         header: 'Industry',
         renderCell: (company) => company.industry || '—',
      },
      {
         key: 'contact',
         header: 'Primary Contact',
         renderCell: (company) => (
            <div className={cell.contactWrapper()}>
               <span className={cell.contactName()}>{company.contact_person || '—'}</span>
               <span className={cell.contactSub()}>{company.contact_email || company.contact_phone || '—'}</span>
            </div>
         ),
      },
      {
         key: 'status',
         header: 'Status',
         renderCell: (company) => (
            <span className={cell.statusBadge({ status: company.status ?? 'INACTIVE' })}>
               {company.status ?? 'INACTIVE'}
            </span>
         ),
      },
      {
         key: 'created_at',
         header: 'Created',
         renderCell: (company) => func.formatDate(company.created_at),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Companies"
            subtitle="Manage tenant organizations, primary contacts, and operational access status."
            createLabel="Create Company"
            csvInputId={param.csvInputId}
            isMutating={param.isPendingMutation}
            isExportDisabled={param.isLoading || param.items.length === 0}
            onImportCsvChange={func.handleImportCsvFile}
            onTriggerImportCsv={func.handleTriggerImportCsv}
            onExportCsv={func.handleExportAllCsv}
            onCreate={func.handleNavigateCreate}
         />

         <SearchPresetTabs
            tabs={PRESET_TABS}
            activeValue={param.statusFilter}
            ariaLabel="Company status presets"
            onChange={func.handleStatusChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by name, tax code, contact person, or email..."
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
            getRowId={(company) => company.id}
            getRowLabel={(company) => company.name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(company) => func.handleNavigateEdit(company.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Building2 className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No companies match your active filters',
               filteredDescription: 'Try adjusting your search keywords or clearing the active status filter.',
               emptyTitle: 'No companies created yet',
               emptyDescription:
                  'Create your first tenant company to start configuring events, games, and administrator accounts.',
               createLabel: 'Create First Company',
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
            title={param.deleteTarget ? `Delete "${param.deleteTarget.name}"?` : 'Delete Company?'}
            entityName={param.deleteTarget?.name ?? ''}
            descriptionSuffix="All linked events and records may be affected. This action cannot be undone."
            confirmLabel="Delete Company"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected companies?`}
            entityName={`${param.selectedIds.length} companies`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};
