import { useMemo, useState } from 'react';

import { useTranslate } from '@admin-web/locale';

import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_SKELETON_ROW_COUNT } from './constants';
import type * as Types from './type';

export function useLogic<T>(properties: Types.Properties<T>) {
   return {
      //
   };
}

// const {
//       data,
//       columns,
//       title,
//       totalCount,
//       headerActions = [],
//       isLoading = false,
//       skeletonRowCount = DEFAULT_SKELETON_ROW_COUNT,
//       searchable = true,
//       searchValue,
//       searchKeys,
//       onSearchChange,
//       filterValue,
//       filters = [],
//       filterGroups = [],
//       onFilterChange,
//       filterFn,
//       rowActions = [],
//       pagination = true,
//       page,
//       pageSize,
//       pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
//       onPageChange,
//       onPageSizeChange,
//    } = properties;

//    const [internalSearch, setInternalSearch] = useState('');
//    const [internalFilter, setInternalFilter] = useState('ALL');
//    const [internalPage, setInternalPage] = useState(1);
//    const [internalPageSize, setInternalPageSize] = useState<number>(pageSizeOptions[0] ?? 10);
//    const { translate } = useTranslate({
//       prefix: 'components.data_table',
//    });

//    const activeSearch = searchValue !== undefined ? searchValue : internalSearch;
//    const activeFilter = filterValue !== undefined ? filterValue : internalFilter;
//    const activePage = page !== undefined ? page : internalPage;
//    const activePageSize = pageSize !== undefined ? pageSize : internalPageSize;

//    const isServerPaginated = totalCount !== undefined || Boolean(onPageChange);
//    const hasFilters = filters.length > 0 || filterGroups.length > 0;
//    const hasHeader = Boolean(title) || headerActions.length > 0;
//    const hasToolbar = searchable || hasFilters;
//    const hasRowActions = rowActions.length > 0;
//    const totalColumnCount = columns.length + (hasRowActions ? 1 : 0);

//    const filteredData = useMemo(() => {
//       let result = data;

//       if (!onSearchChange && activeSearch.trim() && searchKeys && searchKeys.length > 0) {
//          const query = activeSearch.trim().toLowerCase();
//          result = result.filter((row) =>
//             searchKeys.some((key) => {
//                const rawValue = row[key];
//                return rawValue !== null && rawValue !== undefined && String(rawValue).toLowerCase().includes(query);
//             }),
//          );
//       }

//       if (!onFilterChange && activeFilter !== 'ALL' && filterFn) {
//          result = result.filter((row) => filterFn(row, activeFilter));
//       }

//       return result;
//    }, [data, onSearchChange, activeSearch, searchKeys, onFilterChange, activeFilter, filterFn]);

//    const resolvedTotalCount = totalCount !== undefined ? totalCount : filteredData.length;
//    const totalPages = Math.max(1, Math.ceil(resolvedTotalCount / activePageSize));
//    const safePage = Math.min(activePage, totalPages);

//    const displayRows = useMemo(() => {
//       if (isServerPaginated || !pagination) {
//          return filteredData;
//       }

//       const startIndex = (safePage - 1) * activePageSize;
//       return filteredData.slice(startIndex, startIndex + activePageSize);
//    }, [filteredData, isServerPaginated, pagination, safePage, activePageSize]);

//    const rangeStart = resolvedTotalCount === 0 ? 0 : (safePage - 1) * activePageSize + 1;
//    const rangeEnd = Math.min(resolvedTotalCount, safePage * activePageSize);
//    const isPrevDisabled = isLoading || safePage <= 1;
//    const isNextDisabled = isLoading || safePage >= totalPages;

//    const skeletonRows = useMemo(
//       () => Array.from({ length: skeletonRowCount }, (_, index) => index),
//       [skeletonRowCount],
//    );

//    const handleSearchChange: Types.Handle_Search_Change = (event) => {
//       const nextValue = event.target.value;
//       if (onSearchChange) {
//          onSearchChange(nextValue);
//       } else {
//          setInternalSearch(nextValue);
//          setInternalPage(1);
//       }
//    };

//    const handleClearSearch = () => {
//       if (onSearchChange) {
//          onSearchChange('');
//       } else {
//          setInternalSearch('');
//          setInternalPage(1);
//       }
//    };

//    const handleFilterChange: Types.Handle_Select_Change = (event) => {
//       const nextValue = event.target.value;
//       if (onFilterChange) {
//          onFilterChange(nextValue);
//       } else {
//          setInternalFilter(nextValue);
//          setInternalPage(1);
//       }
//    };

//    const handleLimitChange: Types.Handle_Select_Change = (event) => {
//       const nextSize = Number(event.target.value);
//       if (onPageSizeChange) {
//          onPageSizeChange(nextSize);
//       } else {
//          setInternalPageSize(nextSize);
//          setInternalPage(1);
//       }
//    };

//    const handlePageChange: Types.Handle_Page_Change = (nextPage) => {
//       if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) {
//          return;
//       }

//       if (onPageChange) {
//          onPageChange(nextPage);
//       } else {
//          setInternalPage(nextPage);
//       }
//    };

//    return {
//       param: {
//          displayRows,
//          resolvedTotalCount,
//          totalPages,
//          safePage,
//          activePageSize,
//          pageSizeOptions,
//          rangeStart,
//          rangeEnd,
//          activeSearch,
//          activeFilter,
//          hasHeader,
//          hasToolbar,
//          hasFilters,
//          hasRowActions,
//          totalColumnCount,
//          isPrevDisabled,
//          isNextDisabled,
//          skeletonRows,
//       },
//       func: {
//          translate,
//          handleSearchChange,
//          handleClearSearch,
//          handleFilterChange,
//          handleLimitChange,
//          handlePageChange,
//       },
//    };
