'use client';

import { Suspense } from 'react';
import { Download, Trophy } from 'lucide-react';
import { Toaster } from 'sonner';

import { SearchToolbar } from '@/components/search';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { ToolbarActiveChip, ToolbarFilterSelect, ToolbarSelectOption } from '@/components/search';

const SORT_FIELD_OPTIONS: ReadonlyArray<ToolbarSelectOption> = [{ label: 'Sort: Drawn Time', value: 'won_at' }];

const PageAdminLuckyDrawWinnerSearchContent = () => {
   const { param, func } = useLogic();
   const {
      wrapper,
      headerRow,
      headerText,
      title,
      subtitle,
      exportBtn,
      iconSm,
      iconLg,
      tableCard,
      tableScroll,
      table,
      thead,
      th,
      tbody,
      tr,
      td,
      skeletonCell,
      emptyWrapper,
      emptyIconBox,
      emptyTitle,
      emptyDesc,
      emptyBtn,
      paginationBar,
      paginationInfo,
      paginationControls,
      limitSelect,
      pageBtnGroup,
      pageBtn,
      cell,
   } = useStyle;

   const gameFilterOptions: ToolbarSelectOption[] = [
      { label: 'Game: All Lucky Draws', value: 'ALL' },
      ...param.games.map((g) => ({
         label: g.events ? `Game: ${g.name} (${g.events.name})` : `Game: ${g.name}`,
         value: g.id,
      })),
   ];

   const prizeFilterOptions: ToolbarSelectOption[] = [
      { label: 'Prize: All Tiers', value: 'ALL' },
      ...param.filteredPrizes.map((p) => ({
         label: `Tier #${p.tier_order}: ${p.name}`,
         value: p.id,
      })),
   ];

   const toolbarFilters: ToolbarFilterSelect[] = [];
   if (param.games.length > 0) {
      toolbarFilters.push({
         key: 'game',
         ariaLabel: 'Filter by Lucky Draw game',
         value: param.gameFilter,
         options: gameFilterOptions,
         onChange: func.handleGameFilterChange,
      });
   }
   if (param.filteredPrizes.length > 0) {
      toolbarFilters.push({
         key: 'prize',
         ariaLabel: 'Filter by prize tier',
         value: param.prizeFilter,
         options: prizeFilterOptions,
         onChange: func.handlePrizeFilterChange,
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
   if (param.gameFilter !== 'ALL') {
      const matchedGame = param.games.find((g) => g.id === param.gameFilter);
      activeChips.push({
         key: 'game',
         label: `Game: ${matchedGame?.name ?? param.gameFilter}`,
         onRemove: () => func.handleGameFilterChange('ALL'),
      });
   }
   if (param.prizeFilter !== 'ALL') {
      const matchedPrize = param.filteredPrizes.find((p) => p.id === param.prizeFilter);
      activeChips.push({
         key: 'prize',
         label: `Prize: ${matchedPrize?.name ?? param.prizeFilter}`,
         onRemove: () => func.handlePrizeFilterChange('ALL'),
      });
   }

   const isExportDisabled = param.isLoading || param.isExporting || param.total === 0;

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <div className={headerRow()}>
            <div className={headerText()}>
               <h1 className={title()}>Lucky Draw — Winners Report</h1>
               <p className={subtitle()}>
                  Post-event audit & winner reporting joining drawn prizes, winning attendees, and stage operators.
               </p>
            </div>

            <button
               type="button"
               disabled={isExportDisabled}
               onClick={func.handleExportExcel}
               className={exportBtn({ disabled: isExportDisabled })}
            >
               <Download className={iconSm()} />
               <span>{param.isExporting ? 'Exporting Report...' : 'Export to Excel (.csv)'}</span>
            </button>
         </div>

         <SearchToolbar
            searchValue={param.searchInput}
            searchPlaceholder="Search by winner name, ticket code, email, phone, or company..."
            onSearchChange={func.setSearchInput}
            onClearSearch={func.handleClearSearch}
            filters={toolbarFilters}
            sortBy="won_at"
            sortOptions={SORT_FIELD_OPTIONS}
            sortOrder={param.sortOrder}
            onSortFieldChange={() => {}}
            onToggleSortOrder={func.handleToggleSortOrder}
            activeChips={activeChips}
            onClearAllFilters={func.handleClearAllFilters}
         />

         <div className={tableCard()}>
            <div className={tableScroll()}>
               <table className={table()}>
                  <thead className={thead()}>
                     <tr>
                        <th className={th()}>Winner</th>
                        <th className={th()}>Ticket Code</th>
                        <th className={th()}>Prize & Tier</th>
                        <th className={th()}>Game & Event</th>
                        <th className={th()}>Drawn By</th>
                        <th className={th()}>Won At</th>
                     </tr>
                  </thead>
                  <tbody className={tbody()}>
                     {param.isLoading ? (
                        Array.from({ length: 5 }).map((_, rowIdx) => (
                           <tr
                              key={rowIdx}
                              className={tr()}
                           >
                              {Array.from({ length: 6 }).map((__, colIdx) => (
                                 <td
                                    key={colIdx}
                                    className={td()}
                                 >
                                    <div className={skeletonCell()} />
                                 </td>
                              ))}
                           </tr>
                        ))
                     ) : param.items.length === 0 ? (
                        <tr>
                           <td colSpan={6}>
                              <div className={emptyWrapper()}>
                                 <div className={emptyIconBox()}>
                                    <Trophy className={iconLg()} />
                                 </div>
                                 <h3 className={emptyTitle()}>
                                    {param.hasActiveFilters
                                       ? 'No winners match your active filters'
                                       : 'No Lucky Draw winners drawn yet'}
                                 </h3>
                                 <p className={emptyDesc()}>
                                    {param.hasActiveFilters
                                       ? 'Try clearing your search query or selecting another game/prize tier.'
                                       : 'Winners drawn during live stage sessions in [CLIENT_APP] will appear here automatically.'}
                                 </p>
                                 {param.hasActiveFilters && (
                                    <button
                                       type="button"
                                       onClick={func.handleClearAllFilters}
                                       className={emptyBtn()}
                                    >
                                       Clear All Filters
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ) : (
                        param.items.map((row) => (
                           <tr
                              key={row.id}
                              className={tr()}
                           >
                              <td className={td()}>
                                 <div className={cell.winnerGroup()}>
                                    <span className={cell.winnerName()}>
                                       {row.lucky_draw_attendants?.full_name || '—'}
                                    </span>
                                    <span className={cell.winnerMeta()}>
                                       {[
                                          row.lucky_draw_attendants?.company_name,
                                          row.lucky_draw_attendants?.department,
                                          row.lucky_draw_attendants?.email,
                                       ]
                                          .filter(Boolean)
                                          .join(' • ') || '—'}
                                    </span>
                                 </div>
                              </td>
                              <td className={td()}>
                                 <span className={cell.ticketBadge()}>
                                    {row.lucky_draw_attendants?.ticket_code || '—'}
                                 </span>
                              </td>
                              <td className={td()}>
                                 <div className={cell.prizeGroup()}>
                                    <span className={cell.tierBadge()}>
                                       Tier #{row.lucky_draw_prizes?.tier_order ?? 1}
                                    </span>
                                    <span className={cell.prizeName()}>{row.lucky_draw_prizes?.name || '—'}</span>
                                 </div>
                              </td>
                              <td className={td()}>
                                 <div className={cell.gameGroup()}>
                                    <span className={cell.gameName()}>{row.games?.name || '—'}</span>
                                    <span className={cell.eventName()}>{row.games?.events?.name || '—'}</span>
                                 </div>
                              </td>
                              <td className={td()}>
                                 {row.accounts?.full_name || row.accounts?.email || 'Stage Operator'}
                              </td>
                              <td className={td()}>{func.formatDateTime(row.won_at)}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {param.total > 0 && (
               <div className={paginationBar()}>
                  <span className={paginationInfo()}>
                     Showing {param.rangeStart}–{param.rangeEnd} of {param.total} winners
                  </span>
                  <div className={paginationControls()}>
                     <select
                        aria-label="Rows per page"
                        value={param.limit}
                        onChange={(e) => func.handleLimitChange(Number(e.target.value))}
                        className={limitSelect()}
                     >
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                     </select>

                     <div className={pageBtnGroup()}>
                        <button
                           type="button"
                           disabled={param.page <= 1}
                           onClick={() => func.handlePageChange(param.page - 1)}
                           className={pageBtn({ disabled: param.page <= 1 })}
                        >
                           Previous
                        </button>
                        <button
                           type="button"
                           disabled={param.page >= param.totalPages}
                           onClick={() => func.handlePageChange(param.page + 1)}
                           className={pageBtn({ disabled: param.page >= param.totalPages })}
                        >
                           Next
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export const PageAdminLuckyDrawWinnerSearch: Router_Page = () => (
   <Suspense fallback={null}>
      <PageAdminLuckyDrawWinnerSearchContent />
   </Suspense>
);
