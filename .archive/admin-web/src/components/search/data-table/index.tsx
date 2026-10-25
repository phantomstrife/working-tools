import { ChevronLeft, ChevronRight, Copy, Edit, Inbox, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

import { useStyle } from './use-style';

import type { DataTableProps } from './type';

const DEFAULT_PAGE_SIZES: ReadonlyArray<number> = [10, 20, 50];

export function DataTable<TRow>({
   columns,
   items,
   isLoading,
   skeletonRowCount = 5,
   getRowId,
   getRowLabel,
   selectedIds,
   isAllSelected,
   onToggleSelectAll,
   onToggleSelectRow,
   openMenuId,
   onToggleRowMenu,
   onCloseRowMenu,
   onEditRow,
   onDuplicateRow,
   onDeleteRow,
   emptyState,
   pagination,
}: DataTableProps<TRow>) {
   const {
      container,
      scrollWrapper,
      table,
      thead,
      th,
      thCheckbox,
      thAction,
      tbody,
      tr,
      td,
      tdCheckbox,
      tdAction,
      checkbox,
      menuTrigger,
      menuDropdown,
      menuItem,
      skeletonRow,
      emptyBlock,
      paginationBlock,
      icon,
   } = useStyle;

   const skeletonIndices = Array.from({ length: skeletonRowCount }, (_, index) => index);
   const pageSizeOptions = pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZES;
   const hasRowActions = Boolean(onEditRow || onDuplicateRow || onDeleteRow);

   return (
      <section className={container()}>
         <div className={scrollWrapper()}>
            <table className={table()}>
               <thead className={thead()}>
                  <tr>
                     <th className={thCheckbox()}>
                        <input
                           type="checkbox"
                           checked={isAllSelected}
                           onChange={onToggleSelectAll}
                           className={checkbox()}
                           aria-label="Select all rows on current page"
                        />
                     </th>
                     {columns.map((column) => (
                        <th
                           key={column.key}
                           className={th()}
                        >
                           {column.header}
                        </th>
                     ))}
                     {hasRowActions && <th className={thAction()}>Actions</th>}
                  </tr>
               </thead>

               <tbody className={tbody()}>
                  {isLoading &&
                     skeletonIndices.map((rowKey) => (
                        <tr
                           key={rowKey}
                           className={tr()}
                        >
                           <td className={tdCheckbox()}>
                              <div className={skeletonRow()} />
                           </td>
                           {columns.map((column) => (
                              <td
                                 key={column.key}
                                 className={td()}
                              >
                                 <div className={skeletonRow()} />
                              </td>
                           ))}
                           {hasRowActions && (
                              <td className={tdAction()}>
                                 <div className={skeletonRow()} />
                              </td>
                           )}
                        </tr>
                     ))}

                  {!isLoading &&
                     items.map((row) => {
                        const rowId = getRowId(row);
                        const rowLabel = getRowLabel ? getRowLabel(row) : rowId;
                        const isSelected = selectedIds.includes(rowId);
                        const isMenuOpen = openMenuId === rowId;

                        return (
                           <tr
                              key={rowId}
                              className={tr({ selected: isSelected })}
                           >
                              <td className={tdCheckbox()}>
                                 <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleSelectRow(rowId)}
                                    className={checkbox()}
                                    aria-label={`Select ${rowLabel}`}
                                 />
                              </td>

                              {columns.map((column) => (
                                 <td
                                    key={column.key}
                                    className={td()}
                                 >
                                    {column.renderCell(row)}
                                 </td>
                              ))}

                              {hasRowActions && (
                                 <td className={tdAction()}>
                                    <button
                                       type="button"
                                       onClick={() => onToggleRowMenu(rowId)}
                                       className={menuTrigger()}
                                       aria-label={`Open actions for ${rowLabel}`}
                                    >
                                       <MoreHorizontal className={icon.sm()} />
                                    </button>

                                    {isMenuOpen && (
                                       <div
                                          className={menuDropdown()}
                                          onMouseLeave={onCloseRowMenu}
                                       >
                                          {onEditRow && (
                                             <button
                                                type="button"
                                                onClick={() => onEditRow(row)}
                                                className={menuItem()}
                                             >
                                                <Edit className={icon.xs()} />
                                                Edit
                                             </button>
                                          )}
                                          {onDuplicateRow && (
                                             <button
                                                type="button"
                                                onClick={() => onDuplicateRow(row)}
                                                className={menuItem()}
                                             >
                                                <Copy className={icon.xs()} />
                                                Duplicate
                                             </button>
                                          )}
                                          {onDeleteRow && (
                                             <button
                                                type="button"
                                                onClick={() => onDeleteRow(row)}
                                                className={menuItem({ danger: true })}
                                             >
                                                <Trash2 className={icon.xs()} />
                                                Delete
                                             </button>
                                          )}
                                       </div>
                                    )}
                                 </td>
                              )}
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>

         {!isLoading && items.length === 0 && (
            <div className={emptyBlock.wrapper()}>
               <div className={emptyBlock.iconBox()}>{emptyState.icon ?? <Inbox className={icon.lg()} />}</div>

               {emptyState.hasActiveFilters ? (
                  <>
                     <h2 className={emptyBlock.title()}>
                        {emptyState.filteredTitle ?? 'No records match your active filters'}
                     </h2>
                     <p className={emptyBlock.description()}>
                        {emptyState.filteredDescription ??
                           'Try adjusting your search keywords or clearing active filters.'}
                     </p>
                     <button
                        type="button"
                        onClick={emptyState.onClearFilters}
                        className={emptyBlock.secondaryBtn()}
                     >
                        Clear Filters
                     </button>
                  </>
               ) : (
                  <>
                     <h2 className={emptyBlock.title()}>{emptyState.emptyTitle}</h2>
                     <p className={emptyBlock.description()}>{emptyState.emptyDescription}</p>
                     <button
                        type="button"
                        onClick={emptyState.onCreateFirst}
                        className={emptyBlock.primaryBtn()}
                     >
                        <Plus className={icon.sm()} />
                        {emptyState.createLabel}
                     </button>
                  </>
               )}
            </div>
         )}

         <div className={paginationBlock.wrapper()}>
            <span className={paginationBlock.summary()}>
               Showing {pagination.rangeStart}–{pagination.rangeEnd} of {pagination.total}
            </span>

            <div className={paginationBlock.controls()}>
               <select
                  value={String(pagination.limit)}
                  onChange={(e) => pagination.onLimitChange(e.target.value)}
                  className={paginationBlock.limitSelect()}
                  aria-label="Rows per page"
               >
                  {pageSizeOptions.map((size) => (
                     <option
                        key={size}
                        value={String(size)}
                     >
                        {size} / page
                     </option>
                  ))}
               </select>

               <div className={paginationBlock.navGroup()}>
                  <button
                     type="button"
                     onClick={() => pagination.onPageChange(pagination.page - 1)}
                     disabled={pagination.page <= 1}
                     className={paginationBlock.pageBtn({ disabled: pagination.page <= 1 })}
                     aria-label="Previous page"
                  >
                     <ChevronLeft className={icon.sm()} />
                  </button>

                  <span className={paginationBlock.pageIndicator()}>
                     Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                     type="button"
                     onClick={() => pagination.onPageChange(pagination.page + 1)}
                     disabled={pagination.page >= pagination.totalPages}
                     className={paginationBlock.pageBtn({ disabled: pagination.page >= pagination.totalPages })}
                     aria-label="Next page"
                  >
                     <ChevronRight className={icon.sm()} />
                  </button>
               </div>
            </div>
         </div>
      </section>
   );
}

