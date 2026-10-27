'use client';

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { PAGE_SIZE_OPTIONS, SKELETONS } from '@admin-web/components/datatable/constants';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';
import type * as Types from './type';

export const DataTable = <T,>(properties: Types.Properties<T>) => {
   const { className, compact = false, searchTool, filterTools = [], columns = [] } = properties;

   const { param, func } = useLogic(properties);
   const { root, header, toolbar, table, pagination } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <div className={header.wrapper}>
            <div className={header.title.wrapper}>
               <h3 className={header.title.text}>{param.title}</h3>
               <span className={header.title.badge}>{func.translate('total_count', { count: param.totalCount })}</span>
               {param.hasBatchSelect && param.selectedCount > 0 && (
                  <span className={header.title.selected_badge}>
                     {func.translate('selected_count', { count: param.selectedCount })}
                     <button
                        type="button"
                        aria-label="Clear selection"
                        className={header.title.clear_button}
                        onClick={func.handleClearSelection}
                     >
                        <X className={header.title.clear_icon} />
                     </button>
                  </span>
               )}
            </div>
            {param.tools.length > 0 && (
               <div className={header.tools.wrapper}>
                  {param.tools.map((action) => {
                     const IconComponent = action.icon;
                     const isDisabled =
                        Boolean(action.disabled) || (Boolean(action.batchSelect) && param.selectedCount === 0);
                     const label =
                        action.batchSelect && param.selectedCount > 0
                           ? `${action.label} (${param.selectedCount})`
                           : action.label;

                     return (
                        <button
                           key={action.key}
                           type="button"
                           disabled={isDisabled}
                           onClick={() => func.handleToolClick(action)}
                           className={header.tools.button({
                              variant: action.variant ?? 'secondary',
                              disabled: isDisabled,
                           })}
                        >
                           {IconComponent && <IconComponent className={header.tools.icon} />}
                           <span className={header.tools.label}>{label}</span>
                        </button>
                     );
                  })}
               </div>
            )}
         </div>

         <div className={toolbar.wrapper}>
            {searchTool && (
               <div className={toolbar.search.wrapper}>
                  <Search className={toolbar.search.icon} />
                  <input
                     type="text"
                     className={toolbar.search.input}
                     placeholder={searchTool.placeholder ?? func.translate('search_placeholder')}
                     onChange={searchTool.onChange}
                  />
               </div>
            )}
            <div className={toolbar.filter.wrapper}>
               {filterTools.map((tool, index) => (
                  <select
                     key={`datatable-filter-${index}`}
                     className={toolbar.filter.select}
                     onChange={tool.onChange}
                  >
                     <option value="">{func.translate('all_records')}</option>
                     {tool.options.map((item) => (
                        <optgroup
                           key={`datable-option-group-${item.label}`}
                           label={item.label}
                        >
                           {item.options.map((option) => (
                              <option
                                 key={option.value}
                                 value={option.value}
                              >
                                 {option.label}
                              </option>
                           ))}
                        </optgroup>
                     ))}
                  </select>
               ))}
            </div>
         </div>

         <div className={table.scroll_wrapper({ compact })}>
            <table className={table.wrapper}>
               <thead className={table.head.wrapper}>
                  <tr>
                     {param.hasBatchSelect && (
                        <th className={table.head.checkbox_th}>
                           <input
                              ref={(element) => {
                                 if (element) {
                                    element.indeterminate = param.isSomeCurrentPageSelected;
                                 }
                              }}
                              type="checkbox"
                              aria-label="Select all rows on current page"
                              checked={param.isAllCurrentPageSelected}
                              disabled={param.isSelectAllDisabled}
                              onChange={func.handleToggleAll}
                              className={table.checkbox({ disabled: param.isSelectAllDisabled })}
                           />
                        </th>
                     )}
                     {columns.map((column) => (
                        <th
                           key={`datatable-column-${column.key}`}
                           className={table.head.th({ align: column.align })}
                        >
                           {column.header}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className={table.body.wrapper}>
                  {param.isLoading &&
                     SKELETONS.map((_, index) => (
                        <tr
                           key={`datatable-skeleton-${index}`}
                           className={table.body.tr()}
                        >
                           {param.hasBatchSelect && (
                              <td className={table.body.checkbox_td}>
                                 <div className={table.checkbox_skeleton} />
                              </td>
                           )}
                           {columns.map((column) => (
                              <td
                                 key={`datatable-skeleton-${index}-column-${column.key}`}
                                 className={table.body.td({ align: column.align })}
                              >
                                 <div className={table.skeleton} />
                              </td>
                           ))}
                        </tr>
                     ))}

                  {!param.isLoading && param.displayData.length === 0 && (
                     <tr>
                        <td
                           key="datatable-column-empty-state"
                           colSpan={param.totalColumns}
                           className={table.empty_state({ compact })}
                        >
                           {func.translate('no_record')}
                        </td>
                     </tr>
                  )}

                  {!param.isLoading &&
                     param.displayData.length > 0 &&
                     param.displayData.map((row, rowIndex) => {
                        const rowKey = func.resolveRowKey(row, rowIndex);
                        const isRowSelected = param.hasBatchSelect ? param.selectedSet.has(rowKey) : false;

                        return (
                           <tr
                              key={rowKey}
                              className={table.body.tr({ selected: isRowSelected })}
                           >
                              {param.hasBatchSelect && (
                                 <td className={table.body.checkbox_td}>
                                    <input
                                       type="checkbox"
                                       aria-label={`Select row ${rowIndex + 1}`}
                                       checked={isRowSelected}
                                       onChange={() => func.handleToggleRow(row, rowIndex)}
                                       className={table.checkbox()}
                                    />
                                 </td>
                              )}
                              {columns.map((column) => {
                                 const raw = (row as Record<string, unknown>)[column.key];
                                 const value = raw !== null && raw !== undefined && raw !== '' ? String(raw) : '—';

                                 return (
                                    <td
                                       key={column.key}
                                       className={table.body.td({
                                          align: column.align,
                                          emphasis: Boolean(column.emphasis),
                                       })}
                                    >
                                       {column.render ? column.render(row, rowIndex) : value}
                                    </td>
                                 );
                              })}
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>

         <div className={pagination.wrapper}>
            <span className={pagination.summary}>
               {func.translate('sumary', {
                  start: param.rangeStart,
                  end: param.rangeEnd,
                  total: param.totalCount,
               })}
            </span>
            <div className={pagination.control.wrapper}>
               <select
                  value={param.pageSize}
                  onChange={func.handleLimitChange}
                  className={pagination.control.limit_select}
                  aria-label="Rows per page"
               >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                     <option
                        key={size}
                        value={size}
                     >
                        {size} {func.translate('per_page')}
                     </option>
                  ))}
               </select>
               <div className={pagination.control.nav_wrapper}>
                  <button
                     type="button"
                     className={pagination.control.page_button({
                        disabled: param.isPrevDisabled,
                     })}
                     disabled={param.isPrevDisabled}
                     onClick={() => func.handlePageChange(param.safePage - 1)}
                  >
                     <ChevronLeft className={pagination.control.icon} />
                  </button>
                  <span className={pagination.control.page_indicator}>
                     {func.translate('page', {
                        current: param.safePage,
                        total: param.totalPages,
                     })}
                  </span>
                  <button
                     type="button"
                     className={pagination.control.page_button({
                        disabled: param.isNextDisabled,
                     })}
                     disabled={param.isNextDisabled}
                     onClick={() => func.handlePageChange(param.safePage + 1)}
                  >
                     <ChevronRight className={pagination.control.icon} />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};
