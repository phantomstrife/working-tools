import { useCallback, useMemo } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { PAGE_SIZE_OPTIONS } from './constants';

import type * as Types from './type';

export function useLogic<T>(properties: Types.Properties<T>) {
   const {
      title,
      totalCount = 0,
      rowKey,
      tools = [],
      data = [],
      columns = [],
      pagination,
      isLoading = false,
   } = properties;

   const { translate } = useTranslate({
      prefix: 'components.datatable',
   });

   const [state, setState] = useDeepState<Types.State<T>>({
      page: pagination ? pagination.page : 1,
      pageSize: pagination ? pagination.pageSize : PAGE_SIZE_OPTIONS[0],
      selectedMap: {},
   });

   const hasBatchSelect = useMemo(() => tools.some((tool) => Boolean(tool.batchSelect)), [tools]);

   const resolveRowKey = useCallback(
      (row: T, fallbackIndex = 0): string => {
         if (typeof rowKey === 'function') {
            return rowKey(row);
         }

         if (typeof rowKey === 'string' && row && typeof row === 'object' && rowKey in row) {
            return String((row as Record<string, unknown>)[rowKey]);
         }

         if (row && typeof row === 'object' && 'id' in row && (row as Record<string, unknown>).id !== undefined) {
            return String((row as Record<string, unknown>).id);
         }

         return `datatable-row-${fallbackIndex}`;
      },
      [rowKey],
   );

   const currentPage = pagination ? pagination.page : state.page;
   const currentPageSize = pagination ? pagination.pageSize : state.pageSize;

   const totalPages = Math.max(1, Math.ceil(totalCount / currentPageSize));
   const safePage = Math.min(currentPage, totalPages);

   const selectedKeys = useMemo(() => Object.keys(state.selectedMap), [state.selectedMap]);
   const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

   const currentPageEntries = useMemo(() => {
      if (!hasBatchSelect) {
         return [];
      }

      return data.map((row, index) => ({
         key: resolveRowKey(row, index),
         row,
      }));
   }, [data, hasBatchSelect, resolveRowKey]);

   const isAllCurrentPageSelected =
      currentPageEntries.length > 0 && currentPageEntries.every((entry) => selectedSet.has(entry.key));

   const isSomeCurrentPageSelected =
      !isAllCurrentPageSelected && currentPageEntries.some((entry) => selectedSet.has(entry.key));

   const handleToggleAll = () => {
      if (!hasBatchSelect) {
         return;
      }

      const nextMap = { ...state.selectedMap };

      if (isAllCurrentPageSelected) {
         currentPageEntries.forEach((entry) => {
            delete nextMap[entry.key];
         });
      } else {
         currentPageEntries.forEach((entry) => {
            nextMap[entry.key] = entry.row;
         });
      }

      setState({
         selectedMap: nextMap,
      });
   };

   const handleToggleRow = (row: T, index: number) => {
      if (!hasBatchSelect) {
         return;
      }

      const key = resolveRowKey(row, index);
      const nextMap = { ...state.selectedMap };

      if (key in nextMap) {
         delete nextMap[key];
      } else {
         nextMap[key] = row;
      }

      setState({
         selectedMap: nextMap,
      });
   };

   const handleClearSelection = useCallback(() => {
      setState({
         selectedMap: {},
      });
   }, [setState]);

   const handleToolClick = (action: Types.Tool<T>) => {
      if (action.batchSelect) {
         const selectedRows = Object.values(state.selectedMap);

         if (selectedRows.length === 0) {
            return;
         }

         void action.onClick(selectedRows, handleClearSelection);
         return;
      }

      action.onClick();
   };

   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextSize = Number(event.target.value);

      setState({
         page: 1,
         pageSize: nextSize,
      });

      pagination?.onPageSizeChange?.(nextSize);
   };

   const handlePageChange = (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) {
         return;
      }

      setState({
         page: nextPage,
      });

      pagination?.onPageChange?.(nextPage);
   };

   return {
      param: {
         title,
         tools,
         totalCount,
         totalPages,
         totalColumns: columns.length + (hasBatchSelect ? 1 : 0),
         safePage,
         pageSize: currentPageSize,
         rangeStart: totalCount === 0 ? 0 : (safePage - 1) * currentPageSize + 1,
         rangeEnd: Math.min(totalCount, safePage * currentPageSize),
         isLoading,
         isPrevDisabled: isLoading || safePage <= 1,
         isNextDisabled: isLoading || safePage >= totalPages,
         hasBatchSelect,
         selectedSet,
         selectedCount: selectedKeys.length,
         isAllCurrentPageSelected,
         isSomeCurrentPageSelected,
         isSelectAllDisabled: isLoading || currentPageEntries.length === 0,
      },
      func: {
         translate,
         resolveRowKey,
         handleToolClick,
         handleLimitChange,
         handlePageChange,
         handleToggleAll,
         handleToggleRow,
         handleClearSelection,
      },
   };
}
