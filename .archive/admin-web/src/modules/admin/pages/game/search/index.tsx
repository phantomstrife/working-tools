'use client';

import { Suspense } from 'react';
import { Gamepad2 } from 'lucide-react';
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
import type { GameWithEvent } from '@/modules/admin/services/game/get-all/type';
import type { StatusFilter } from './use-logic';

const PRESET_TABS: ReadonlyArray<PresetTabOption<StatusFilter>> = [
   { label: 'All Games', value: 'ALL' },
   { label: 'Pending', value: 'PENDING' },
   { label: 'Ready', value: 'READY' },
   { label: 'Live', value: 'LIVE' },
   { label: 'Finished', value: 'FINISHED' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Status: All', value: 'ALL' },
   { label: 'Status: Pending', value: 'PENDING' },
   { label: 'Status: Ready', value: 'READY' },
   { label: 'Status: Live', value: 'LIVE' },
   { label: 'Status: Finished', value: 'FINISHED' },
];

const GAME_TYPE_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Type: All', value: 'ALL' },
   { label: 'Type: Lucky Draw', value: 'LUCKY_DRAW' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Created Date', value: 'created_at' },
   { label: 'Sort: Updated Date', value: 'updated_at' },
   { label: 'Sort: Game Name', value: 'name' },
   { label: 'Sort: Status', value: 'status' },
];

const PageAdminGameSearchContent = () => {
   const { param, func } = useLogic();
   const { wrapper, cell, iconLg } = useStyle;

   const eventFilterOptions: ToolbarSelectOption[] = [
      { label: 'Event: All', value: 'ALL' },
      ...param.events.map((evt) => ({
         label: `Event: ${evt.name}`,
         value: evt.id,
      })),
   ];

   const toolbarFilters: ToolbarFilterSelect[] = [
      {
         key: 'status',
         ariaLabel: 'Filter by game status',
         value: param.statusFilter,
         options: STATUS_FILTER_OPTIONS,
         onChange: (value) =>
            func.handleStatusChange(
               value === 'PENDING' || value === 'READY' || value === 'LIVE' || value === 'FINISHED' ? value : 'ALL',
            ),
      },
      {
         key: 'gameType',
         ariaLabel: 'Filter by game type',
         value: param.gameTypeFilter,
         options: GAME_TYPE_OPTIONS,
         onChange: func.handleGameTypeChange,
      },
   ];

   if (param.events.length > 0) {
      toolbarFilters.push({
         key: 'event',
         ariaLabel: 'Filter by event',
         value: param.eventFilter,
         options: eventFilterOptions,
         onChange: func.handleEventFilterChange,
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
   if (param.gameTypeFilter !== 'ALL') {
      activeChips.push({
         key: 'gameType',
         label: `Type: ${param.gameTypeFilter}`,
         onRemove: () => func.handleGameTypeChange('ALL'),
      });
   }
   if (param.eventFilter !== 'ALL') {
      const matchedEvent = param.events.find((e) => e.id === param.eventFilter);
      activeChips.push({
         key: 'event',
         label: `Event: ${matchedEvent?.name ?? param.eventFilter}`,
         onRemove: () => func.handleEventFilterChange('ALL'),
      });
   }

   const bulkActions: ReadonlyArray<BulkActionItem> = [
      {
         key: 'ready',
         label: 'Set Ready',
         onClick: () => func.handleBulkStatusChange('READY'),
      },
      {
         key: 'live',
         label: 'Set Live',
         onClick: () => func.handleBulkStatusChange('LIVE'),
      },
      {
         key: 'finished',
         label: 'Set Finished',
         onClick: () => func.handleBulkStatusChange('FINISHED'),
      },
   ];

   const columns: ReadonlyArray<DataTableColumn<GameWithEvent>> = [
      {
         key: 'game',
         header: 'Game',
         renderCell: (gameItem) => (
            <div className={cell.gameWrapper()}>
               <div className={cell.titleRow()}>
                  <button
                     type="button"
                     onClick={() => func.handleNavigateEdit(gameItem.id)}
                     className={cell.gameNameBtn()}
                  >
                     {gameItem.name}
                  </button>
                  {gameItem.is_dev_only && <span className={cell.devBadge()}>DEV ONLY</span>}
               </div>
               <span className={cell.gameDesc()}>{gameItem.description || 'No description'}</span>
            </div>
         ),
      },
      {
         key: 'event',
         header: 'Event',
         renderCell: (gameItem) => gameItem.events?.name || '—',
      },
      {
         key: 'type',
         header: 'Game Type',
         renderCell: (gameItem) => <span className={cell.typeBadge()}>{gameItem.game_type}</span>,
      },
      {
         key: 'staff',
         header: 'Assigned Staff',
         renderCell: (gameItem) => {
            const count = gameItem.game_accounts?.length ?? 0;
            return <span className={cell.staffCountBadge()}>{count} staff</span>;
         },
      },
      {
         key: 'status',
         header: 'Status',
         renderCell: (gameItem) => (
            <span className={cell.statusBadge({ status: gameItem.status ?? 'PENDING' })}>
               {gameItem.status ?? 'PENDING'}
            </span>
         ),
      },
      {
         key: 'created_at',
         header: 'Created',
         renderCell: (gameItem) => func.formatDate(gameItem.created_at),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Games"
            subtitle="Configure interactive event games, assign on-site operators and guards, and manage live readiness."
            createLabel="Create Game"
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
            ariaLabel="Game status presets"
            onChange={func.handleStatusChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by game name or description..."
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
            getRowId={(gameItem) => gameItem.id}
            getRowLabel={(gameItem) => gameItem.name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(gameItem) => func.handleNavigateEdit(gameItem.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Gamepad2 className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No games match your active filters',
               filteredDescription: 'Try adjusting your search keywords or clearing active status and event filters.',
               emptyTitle: 'No games created yet',
               emptyDescription:
                  'Create your first interactive game (e.g., Lucky Draw), assign on-site staff, and configure prizes.',
               createLabel: 'Create First Game',
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
            title={param.deleteTarget ? `Delete "${param.deleteTarget.name}"?` : 'Delete Game?'}
            entityName={param.deleteTarget?.name ?? ''}
            descriptionSuffix="All associated prizes, attendees, and winners for this game will be permanently deleted."
            confirmLabel="Delete Game"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected games?`}
            entityName={`${param.selectedIds.length} games`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};

export const PageAdminGameSearch: Router_Page = () => (
   <Suspense fallback={null}>
      <PageAdminGameSearchContent />
   </Suspense>
);
