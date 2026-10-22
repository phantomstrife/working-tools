'use client';

import { Calendar } from 'lucide-react';
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
import type { EventWithCompany } from '@/modules/admin/services/event/get-all/type';
import type { StatusFilter } from './use-logic';

const PRESET_TABS: ReadonlyArray<PresetTabOption<StatusFilter>> = [
   { label: 'All Events', value: 'ALL' },
   { label: 'Draft', value: 'DRAFT' },
   { label: 'Upcoming', value: 'UPCOMING' },
   { label: 'Ongoing', value: 'ONGOING' },
   { label: 'Completed', value: 'COMPLETED' },
   { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Status: All', value: 'ALL' },
   { label: 'Status: Draft', value: 'DRAFT' },
   { label: 'Status: Upcoming', value: 'UPCOMING' },
   { label: 'Status: Ongoing', value: 'ONGOING' },
   { label: 'Status: Completed', value: 'COMPLETED' },
   { label: 'Status: Cancelled', value: 'CANCELLED' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Created Date', value: 'created_at' },
   { label: 'Sort: Start Date', value: 'start_time' },
   { label: 'Sort: Updated Date', value: 'updated_at' },
   { label: 'Sort: Event Name', value: 'name' },
   { label: 'Sort: Status', value: 'status' },
];

export const PageAdminEventSearch: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, cell, iconLg } = useStyle;

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
         ariaLabel: 'Filter by event status',
         value: param.statusFilter,
         options: STATUS_FILTER_OPTIONS,
         onChange: (value) =>
            func.handleStatusChange(
               value === 'DRAFT' ||
                  value === 'UPCOMING' ||
                  value === 'ONGOING' ||
                  value === 'COMPLETED' ||
                  value === 'CANCELLED'
                  ? value
                  : 'ALL',
            ),
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
         key: 'upcoming',
         label: 'Set Upcoming',
         onClick: () => func.handleBulkStatusChange('UPCOMING'),
      },
      {
         key: 'ongoing',
         label: 'Set Ongoing',
         onClick: () => func.handleBulkStatusChange('ONGOING'),
      },
      {
         key: 'completed',
         label: 'Set Completed',
         onClick: () => func.handleBulkStatusChange('COMPLETED'),
      },
      {
         key: 'cancelled',
         label: 'Set Cancelled',
         onClick: () => func.handleBulkStatusChange('CANCELLED'),
      },
   ];

   const columns: ReadonlyArray<DataTableColumn<EventWithCompany>> = [
      {
         key: 'event',
         header: 'Event',
         renderCell: (eventItem) => (
            <div className={cell.eventWrapper()}>
               <button
                  type="button"
                  onClick={() => func.handleNavigateEdit(eventItem.id)}
                  className={cell.eventNameBtn()}
               >
                  {eventItem.name}
               </button>
               <span className={cell.eventSlug()}>/{eventItem.slug}</span>
            </div>
         ),
      },
      {
         key: 'company',
         header: 'Company',
         renderCell: (eventItem) => eventItem.companies?.name || '—',
      },
      {
         key: 'venue',
         header: 'Venue / Location',
         renderCell: (eventItem) => (
            <div className={cell.venueWrapper()}>
               <span className={cell.venueName()}>{eventItem.location_name || 'No venue name'}</span>
               <span className={cell.venueAddress()}>{eventItem.location_address || '—'}</span>
            </div>
         ),
      },
      {
         key: 'schedule',
         header: 'Schedule',
         renderCell: (eventItem) => func.formatSchedule(eventItem.start_time, eventItem.end_time),
      },
      {
         key: 'status',
         header: 'Status',
         renderCell: (eventItem) => (
            <span className={cell.statusBadge({ status: eventItem.status ?? 'DRAFT' })}>
               {eventItem.status ?? 'DRAFT'}
            </span>
         ),
      },
      {
         key: 'created_at',
         header: 'Created',
         renderCell: (eventItem) => func.formatDate(eventItem.created_at),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Events"
            subtitle="Manage event schedules, venue locations, custom branding, and live game readiness."
            createLabel="Create Event"
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
            ariaLabel="Event status presets"
            onChange={func.handleStatusChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by event name, slug, venue, or address..."
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
            getRowId={(eventItem) => eventItem.id}
            getRowLabel={(eventItem) => eventItem.name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(eventItem) => func.handleNavigateEdit(eventItem.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Calendar className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No events match your active filters',
               filteredDescription: 'Try adjusting your search keywords or clearing active status filters.',
               emptyTitle: 'No events created yet',
               emptyDescription:
                  'Create your first event to configure interactive games, prizes, and attendee check-ins.',
               createLabel: 'Create First Event',
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
            title={param.deleteTarget ? `Delete "${param.deleteTarget.name}"?` : 'Delete Event?'}
            entityName={param.deleteTarget?.name ?? ''}
            descriptionSuffix="All associated games, prizes, and attendee records will be permanently deleted."
            confirmLabel="Delete Event"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected events?`}
            entityName={`${param.selectedIds.length} events`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};

