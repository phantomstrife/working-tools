'use client';

import { Gift } from 'lucide-react';
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
   DataTableColumn,
   PresetTabOption,
   ToolbarActiveChip,
   ToolbarFilterSelect,
   ToolbarSelectOption,
} from '@/components/search';
import type { PrizeWithRelations } from '@/modules/admin/services/lucky-draw/prize/get-all/type';
import type { StockFilter } from './use-logic';

const PRESET_TABS: ReadonlyArray<PresetTabOption<StockFilter>> = [
   { label: 'All Prizes', value: 'ALL' },
   { label: 'In Stock', value: 'IN_STOCK' },
   { label: 'Depleted', value: 'DEPLETED' },
];

const STOCK_FILTER_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Stock: All', value: 'ALL' },
   { label: 'Stock: In Stock (> 0)', value: 'IN_STOCK' },
   { label: 'Stock: Depleted (0)', value: 'DEPLETED' },
];

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [
   { label: 'Sort: Tier Order', value: 'tier_order' },
   { label: 'Sort: Prize Name', value: 'name' },
   { label: 'Sort: Total Quantity', value: 'total_quantity' },
   { label: 'Sort: Remaining Quantity', value: 'remaining_quantity' },
   { label: 'Sort: Created Date', value: 'created_at' },
];

export const PageAdminLuckyDrawPrizeSearch: Router_Page = () => {
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
         key: 'stock',
         ariaLabel: 'Filter by stock status',
         value: param.stockFilter,
         options: STOCK_FILTER_OPTIONS,
         onChange: (value) =>
            func.handleStockChange(value === 'IN_STOCK' || value === 'DEPLETED' ? value : 'ALL'),
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
   if (param.stockFilter !== 'ALL') {
      activeChips.push({
         key: 'stock',
         label: `Stock: ${param.stockFilter}`,
         onRemove: () => func.handleStockChange('ALL'),
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

   const columns: ReadonlyArray<DataTableColumn<PrizeWithRelations>> = [
      {
         key: 'tier',
         header: 'Tier',
         renderCell: (prizeItem) => <span className={cell.tierBadge()}>Tier #{prizeItem.tier_order}</span>,
      },
      {
         key: 'prize',
         header: 'Prize',
         renderCell: (prizeItem) => (
            <div className={cell.prizeWrapper()}>
               <div className={cell.thumb()}>
                  {prizeItem.image_url ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={prizeItem.image_url} alt={prizeItem.name} className={cell.thumbImg()} />
                  ) : (
                     <Gift className={iconLg()} />
                  )}
               </div>
               <div className={cell.textGroup()}>
                  <button
                     type="button"
                     onClick={() => func.handleNavigateEdit(prizeItem.id)}
                     className={cell.prizeNameBtn()}
                  >
                     {prizeItem.name}
                  </button>
                  <span className={cell.prizeDesc()}>{prizeItem.description || 'No description'}</span>
               </div>
            </div>
         ),
      },
      {
         key: 'game',
         header: 'Game & Event',
         renderCell: (prizeItem) => (
            <div className={cell.gameCell()}>
               <span className={cell.gameName()}>{prizeItem.games?.name || '—'}</span>
               <span className={cell.eventName()}>{prizeItem.games?.events?.name || '—'}</span>
            </div>
         ),
      },
      {
         key: 'inventory',
         header: 'Inventory (Remaining / Total)',
         renderCell: (prizeItem) => {
            const state =
               prizeItem.remaining_quantity === 0
                  ? 'DEPLETED'
                  : prizeItem.remaining_quantity <= Math.ceil(prizeItem.total_quantity * 0.25)
                    ? 'LOW_STOCK'
                    : 'IN_STOCK';
            const stateLabel =
               state === 'DEPLETED' ? 'Depleted' : state === 'LOW_STOCK' ? 'Low Stock' : 'In Stock';

            return (
               <div className={cell.quantityWrapper()}>
                  <span className={cell.quantityText()}>
                     {prizeItem.remaining_quantity} / {prizeItem.total_quantity} remaining
                  </span>
                  <span className={cell.stockBadge({ state })}>{stateLabel}</span>
               </div>
            );
         },
      },
      {
         key: 'created_at',
         header: 'Created',
         renderCell: (prizeItem) => func.formatDate(prizeItem.created_at),
      },
   ];

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <SearchPageHeader
            title="Lucky Draw — Prizes"
            subtitle="Configure prize tiers, images, and inventory quantities for Lucky Draw games."
            createLabel="Create Prize"
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
            activeValue={param.stockFilter}
            ariaLabel="Prize stock presets"
            onChange={func.handleStockChange}
         />

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by prize name or description..."
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
            actions={[]}
            onClearSelection={func.clearSelection}
            onExportSelected={func.handleBulkExportCsv}
            onDeleteSelected={func.handleOpenBulkDelete}
         />

         <DataTable
            columns={columns}
            items={param.items}
            isLoading={param.isLoading}
            getRowId={(prizeItem) => prizeItem.id}
            getRowLabel={(prizeItem) => prizeItem.name}
            selectedIds={param.selectedIds}
            isAllSelected={param.isAllSelected}
            onToggleSelectAll={func.handleToggleSelectAll}
            onToggleSelectRow={func.handleToggleSelectRow}
            openMenuId={param.openMenuId}
            onToggleRowMenu={func.handleToggleRowMenu}
            onCloseRowMenu={func.handleCloseRowMenu}
            onEditRow={(prizeItem) => func.handleNavigateEdit(prizeItem.id)}
            onDuplicateRow={func.handleDuplicateRow}
            onDeleteRow={func.handlePromptDelete}
            emptyState={{
               icon: <Gift className={iconLg()} />,
               hasActiveFilters: param.hasActiveFilters,
               filteredTitle: 'No prizes match your active filters',
               filteredDescription: 'Try adjusting your search keywords or clearing active game and stock filters.',
               emptyTitle: 'No Lucky Draw prizes configured yet',
               emptyDescription:
                  'Create prize tiers with quantities and images for your Lucky Draw games.',
               createLabel: 'Create First Prize',
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
            title={param.deleteTarget ? `Delete "${param.deleteTarget.name}"?` : 'Delete Prize?'}
            entityName={param.deleteTarget?.name ?? ''}
            descriptionSuffix="All winner records associated with this prize will also be permanently deleted."
            confirmLabel="Delete Prize"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />

         <ConfirmDeleteModal
            isOpen={param.isBulkDeleteOpen}
            title={`Delete ${param.selectedIds.length} selected prizes?`}
            entityName={`${param.selectedIds.length} prizes`}
            confirmLabel="Delete Selected"
            isPending={param.isPendingMutation}
            onCancel={func.handleCancelBulkDelete}
            onConfirm={func.handleConfirmBulkDelete}
         />
      </div>
   );
};

