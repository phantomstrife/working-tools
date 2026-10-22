'use client';

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
import type { AttendantWithRelations } from '@/modules/admin/services/lucky-draw/attendant/get-all/type';
import type { PresetView } from './use-logic';

const PRESET_TABS: ReadonlyArray<PresetTabOption<PresetView>> = [
   { label: 'All Attendees', value: 'ALL' },
   { label: 'Checked In', value: 'CHECKED_IN' },
   { label: 'Not Checked In', value: 'NOT_CHECKED_IN' },
   { label: 'Winners', value: 'WINNERS' },
];

const EMAIL_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Email: All', value: 'ALL' },
   { label: 'Email: Not Sent', value: 'NOT_SENT' },
   { label: 'Email: Sending', value: 'SENDING' },
   { label: 'Email: Sent', value: 'SENT' },
   { label: 'Email: Failed', value: 'FAILED' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Created Date', value: 'created_at' },
   { label: 'Sort: Full Name', value: 'full_name' },
   { label: 'Sort: Ticket Code', value: 'ticket_code' },
   { label: 'Sort: Email Status', value: 'email_status' },
   { label: 'Sort: Check-In Time', value: 'checked_in_at' },
];

export const PageAdminLuckyDrawAttendantSearch: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, cell, iconLg } = useStyle;

   const gameFilterOptions: ToolbarSelectOption[] = [
      { label: 'Game: All Lucky Draws', value: 'ALL' },
      ...param.games.map((g) => ({
         label: g.events ? `Game: ${g.name} (${g.events.name})` : `Game: ${g.name}`,
         value: g.id,
      })),
   ];

   const toolbarFilters: ToolbarFilterSelect[] = [
      {
         key: 'emailStatus',
         ariaLabel: 'Filter by email dispatch status',
         value: param.emailFilter,
         options: EMAIL_FILTER_OPTIONS,
         onChange: (value) =>
            func.handleEmailFilterChange(
               value === 'NOT_SENT' || value === 'SENDING' || value === 'SENT' || value === 'FAILED'
                  ? value
                  : 'ALL',
            ),
      },
   ];

   if (param.games.length > 0) {
      toolbarFilters.push({
         key: 'game',
         ariaLabel: 'Filter by Lucky Draw game',
         value: param.gameFilter,
         options: gameFilterOptions,
         onChange: func.handleGameFilterChange,
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
   if (param.presetView !== 'ALL') {
      activeChips.push({
         key: 'preset',
         label: `View: ${param.presetView}`,
         onRemove: () => func.handlePresetChange('ALL'),
      });
   }
   if (param.emailFilter !== 'ALL') {
      activeChips.push({
         key: 'emailStatus',
         label: `Email: ${param.emailFilter}`,
         onRemove: () => func.handleEmailFilterChange('ALL'),
      });
   }
   if (param.gameFilter !== 'ALL') {
      const matchedGame = param.games.find((g) => g.id === param.gameFilter);
      activeChips.push({
         key: 'game',
         label: `Game: ${matchedGame?.name ?? param.gameFilter}`,
         onRemove: () => func.handleGameFilterChange('ALL'),
      });
   }

   const bulkActions: ReadonlyArray<BulkActionItem> = [
      {
         key: 'send-batch-email',
         label: 'Send Batch Emails',
         onClick: func.handleSendBatchEmails,
      },
      {
         key: 'check-in',
         label: 'Mark Checked In',
         onClick: func.handleBulkCheckIn,
      },
   ];

   const columns: ReadonlyArray<DataTableColumn<AttendantWithRelations>> = [
      {
         key: 'attendant',
         header: 'Attendee',
         renderCell: (row) => (
            <div className={cell.attendantWrapper()}>
               <div className={cell.nameRow()}>
                  <button
                     type="button"
                     onClick={() => func.handleNavigateEdit(row.id)}
                     className={cell.nameBtn()}
                  >
                     {row.full_name}
                  </button>
                  {row.has_won && <span className={cell.winnerBadge()}>WINNER</span>}
               </div>
               <span className={cell.contactMeta()}>
                  {[row.email, row.phone].filter(Boolean).join(' • ') || 'No contact info'}
               </span>
            </div>
         ),
      },
      {
         key: 'ticket',
         header: 'Ticket & QR Hash',
         renderCell: (row) => (
            <div className={cell.ticketGroup()}>
               <span className={cell.ticketBadge()}>{row.ticket_code}</span>
               <span className={cell.qrPayload()} title={row.qr_code_payload}>
                  {row.qr_code_payload}
               </span>
            </div>
         ),
      },
      {
         key: 'org',
         header: 'Company / Dept',
         renderCell: (row) => (
            <div className={cell.orgGroup()}>
               <span className={cell.orgCompany()}>{row.company_name || '—'}</span>
               <span className={cell.orgDept()}>{row.department || '—'}</span>
            </div>
         ),
      },
      {
         key: 'game',
         header: 'Game',
         renderCell: (row) => row.games?.name || '—',
      },
      {
         key: 'email_status',
         header: 'Email Status',
         renderCell: (row) => (
            <span className={cell.emailBadge({ status: row.email_status ?? 'NOT_SENT' })}>
               {row.email_status ?? 'NOT_SENT'}
            </span>
         ),
      },
      {
         key: 'check_in',
         header: 'Check-In',
         renderCell: (row) => (
            <div>
               <span className={cell.checkInBadge({ checkedIn: Boolean(row.is_checked_in) })}>
                  {row.is_checked_in ? 'Checked In' : 'Pending'}
               </span>
               {row.is_checked_in && row.check_in_method && (
                  <span className={cell.checkInSub()}>{row.check_in_method}</span>
               )}
            </div>
         ),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Lucky Draw — Attendants"
            subtitle="Import event guests via CSV, generate unique QR check-in codes, and dispatch batch ticket emails."
            createLabel="Add Attendant"
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
            activeValue={param.presetView}
            ariaLabel="Attendant view presets"
            onChange={func.handlePresetChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by name, ticket code, email, phone, or company..."
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
            getRowId={(row) => row.id}
            getRowLabel={(row) => row.full_name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(row) => func.handleNavigateEdit(row.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Users className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No attendees match your active filters',
               filteredDescription:
                  'Try adjusting your search keywords or clearing active check-in, email, and game filters.',
               emptyTitle: 'No Lucky Draw attendees added yet',
               emptyDescription:
                  'Import a CSV list of attendees or manually register guests to generate their QR check-in passes.',
               createLabel: 'Add First Attendant',
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
            title={param.deleteTarget ? `Delete "${param.deleteTarget.full_name}"?` : 'Delete Attendant?'}
            entityName={param.deleteTarget?.full_name ?? ''}
            descriptionSuffix="Any associated winner records for this attendee will also be permanently deleted."
            confirmLabel="Delete Attendant"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected attendees?`}
            entityName={`${param.selectedIds.length} attendees`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};

