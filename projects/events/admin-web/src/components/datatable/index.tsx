'use client';

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const DataTable = <T,>(properties: Types.Properties<T>) => {
   const { root } = useStyle;

   return <div className={root.wrapper}>Hello</div>;
};

{
   /*
   const {
      columns,
      getRowKey,
      title,
      countUnit,
      headerActions = [],
      isLoading = false,
      emptyText,
      searchable = true,
      searchPlaceholder,
      filterAllLabel,
      filters = [],
      filterGroups = [],
      rowActions = [],
      actionsHeaderLabel,
      pagination = true,
   } = properties;

   const { param, func } = useLogic(properties);
   const { root, header, toolbar, table, pagination: paginationStyle } = useStyle;

   const unitLabel = countUnit ?? func.translate('records_unit');

   {param.hasHeader && (
   <div className={header.wrapper}>
      <div className={header.title.wrapper}>
         {title && <h3 className={header.title.text}>{title}</h3>}
         <span className={header.title.badge}>
            {param.resolvedTotalCount} {unitLabel}
         </span>
      </div>
      {headerActions.length > 0 && (
         <div className={header.action.wrapper}>
            {headerActions.map((action) => {
               const IconComponent = action.icon;

               return (
                  <button
                     key={action.key}
                     type="button"
                     disabled={action.disabled || isLoading}
                     onClick={action.onClick}
                     className={header.action.button({
                        variant: action.variant ?? 'secondary',
                        disabled: Boolean(action.disabled || isLoading),
                     })}
                  >
                     {IconComponent && <IconComponent className={header.action.icon} />}
                     <span className={action.hideLabelOnMobile ? header.action.label_responsive : undefined}>
                        {action.label}
                     </span>
                  </button>
               );
            })}
         </div>
      )}
   </div>
)}
{param.hasToolbar && (
   <div className={toolbar.wrapper}>
      {searchable && (
         <div className={toolbar.search.wrapper}>
            <Search className={toolbar.search.icon} />
            <input
               type="text"
               value={param.activeSearch}
               onChange={func.handleSearchChange}
               placeholder={searchPlaceholder ?? func.translate('toolbar.search_placeholder')}
               className={toolbar.search.input}
            />
            {param.activeSearch && (
               <button
                  type="button"
                  aria-label="Clear search"
                  onClick={func.handleClearSearch}
                  className={toolbar.search.clear_button}
               >
                  <X className={toolbar.search.clear_icon} />
               </button>
            )}
         </div>
      )}
      {param.hasFilters && (
         <select
            aria-label="Filter records"
            value={param.activeFilter}
            onChange={func.handleFilterChange}
            className={toolbar.filter_select}
         >
            <option value="ALL">{filterAllLabel ?? func.translate('toolbar.all_records')}</option>
            {filters.map((option) => (
               <option
                  key={option.value}
                  value={option.value}
               >
                  {option.label}
               </option>
            ))}
            {filterGroups.map((group) => (
               <optgroup
                  key={group.groupLabel}
                  label={group.groupLabel}
               >
                  {group.options.map((option) => (
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
      )}
   </div>
)}
<div className={table.scroll_wrapper}>
   <table className={table.wrapper}>
      <thead className={table.head.wrapper}>
         <tr>
            {columns.map((column) => (
               <th
                  key={column.key}
                  className={table.head.th({ align: column.align })}
               >
                  {column.header}
               </th>
            ))}
            {param.hasRowActions && (
               <th className={table.head.th({ align: 'right' })}>
                  {actionsHeaderLabel ?? func.translate('table.actions_header')}
               </th>
            )}
         </tr>
      </thead>
      <tbody className={table.body.wrapper}>
         {isLoading ? (
            param.skeletonRows.map((rowIndex) => (
               <tr
                  key={rowIndex}
                  className={table.body.tr}
               >
                  {columns.map((column) => (
                     <td
                        key={column.key}
                        className={table.body.td({ align: column.align })}
                     >
                        <div className={table.body.skeleton} />
                     </td>
                  ))}
                  {param.hasRowActions && (
                     <td className={table.body.td({ align: 'right' })}>
                        <div className={table.body.skeleton} />
                     </td>
                  )}
               </tr>
            ))
         ) : param.displayRows.length === 0 ? (
            <tr>
               <td
                  colSpan={param.totalColumnCount}
                  className={table.body.empty_state}
               >
                  {emptyText ?? func.translate('table.empty_state')}
               </td>
            </tr>
         ) : (
            param.displayRows.map((row, rowIndex) => (
               <tr
                  key={getRowKey(row, rowIndex)}
                  className={table.body.tr}
               >
                  {columns.map((column) => {
                     const rawValue = (row as Record<string, unknown>)[column.key];

                     return (
                        <td
                           key={column.key}
                           className={table.body.td({
                              align: column.align,
                              emphasis: Boolean(column.emphasis),
                           })}
                        >
                           {column.render
                              ? column.render(row, rowIndex)
                              : rawValue !== null && rawValue !== undefined && rawValue !== ''
                                 ? String(rawValue)
                                 : '—'}
                        </td>
                     );
                  })}
                  {param.hasRowActions && (
                     <td className={table.body.td({ align: 'right' })}>
                        <div className={table.action.wrapper}>
                           {rowActions.map((action) => {
                              const ActionIcon = action.icon;

                              return (
                                 <button
                                    key={action.key}
                                    type="button"
                                    title={action.title}
                                    disabled={action.disabled}
                                    onClick={() => action.onClick(row)}
                                    className={table.action.button({
                                       danger: Boolean(action.danger),
                                       disabled: Boolean(action.disabled),
                                    })}
                                 >
                                    <ActionIcon className={table.action.icon} />
                                 </button>
                              );
                           })}
                        </div>
                     </td>
                  )}
               </tr>
            ))
         )}
      </tbody>
   </table>
</div>
{pagination && (
   <div className={paginationStyle.wrapper}>
      <span className={paginationStyle.summary}>
         {func.translate('pagination.showing')} {param.rangeStart} {func.translate('pagination.to')}{' '}
         {param.rangeEnd} {func.translate('pagination.of')} {param.resolvedTotalCount} {unitLabel}
      </span>
      <div className={paginationStyle.control.wrapper}>
         <select
            value={param.activePageSize}
            onChange={func.handleLimitChange}
            className={paginationStyle.control.limit_select}
            aria-label="Rows per page"
         >
            {param.pageSizeOptions.map((size) => (
               <option
                  key={size}
                  value={size}
               >
                  {size} / {func.translate('pagination.per_page')}
               </option>
            ))}
         </select>
         <div className={paginationStyle.control.nav_wrapper}>
            <button
               type="button"
               disabled={param.isPrevDisabled}
               onClick={() => func.handlePageChange(param.safePage - 1)}
               className={paginationStyle.control.page_button({
                  disabled: param.isPrevDisabled,
               })}
               aria-label="Previous page"
            >
               <ChevronLeft className={paginationStyle.control.icon} />
            </button>
            <span className={paginationStyle.control.page_indicator}>
               {func.translate('pagination.page')} {param.safePage} {func.translate('pagination.of')}{' '}
               {param.totalPages}
            </span>
            <button
               type="button"
               disabled={param.isNextDisabled}
               onClick={() => func.handlePageChange(param.safePage + 1)}
               className={paginationStyle.control.page_button({
                  disabled: param.isNextDisabled,
               })}
               aria-label="Next page"
            >
               <ChevronRight className={paginationStyle.control.icon} />
            </button>
         </div>
      </div>
   </div>
)}
</div> */
}
