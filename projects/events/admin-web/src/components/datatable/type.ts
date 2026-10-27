// import type { ChangeEvent, ComponentType, ReactNode } from 'react';

// export type ColumnAlign = 'left' | 'center' | 'right';

// export interface ColumnDef<T> {
//    key: string;
//    header: ReactNode;
//    align?: ColumnAlign;
//    emphasis?: boolean;
//    render?: (row: T, index: number) => ReactNode;
// }

// export interface HeaderAction {
//    key: string;
//    label: string;
//    icon?: ComponentType<{ className?: string }>;
//    variant?: 'primary' | 'secondary';
//    hideLabelOnMobile?: boolean;
//    disabled?: boolean;
//    onClick: () => void;
// }

// export interface RowAction<T> {
//    key: string;
//    title?: string;
//    icon: ComponentType<{ className?: string }>;
//    danger?: boolean;
//    disabled?: boolean;
//    onClick: (row: T) => void;
// }

// export interface FilterOption {
//    label: string;
//    value: string;
// }

// export interface FilterGroup {
//    groupLabel: string;
//    options: FilterOption[];
// }

// export interface Properties<T> {
//    data: T[];
//    columns: ColumnDef<T>[];
//    getRowKey: (row: T, index: number) => string | number;
//    title?: ReactNode;
//    totalCount?: number;
//    countUnit?: string;
//    headerActions?: HeaderAction[];
//    isLoading?: boolean;
//    skeletonRowCount?: number;
//    emptyText?: ReactNode;
//    searchable?: boolean;
//    searchValue?: string;
//    searchPlaceholder?: string;
//    searchKeys?: Array<keyof T>;
//    onSearchChange?: (value: string) => void;
//    filterValue?: string;
//    filterAllLabel?: string;
//    filters?: FilterOption[];
//    filterGroups?: FilterGroup[];
//    onFilterChange?: (value: string) => void;
//    filterFn?: (row: T, filterValue: string) => boolean;
//    rowActions?: RowAction<T>[];
//    actionsHeaderLabel?: ReactNode;
//    pagination?: boolean;
//    page?: number;
//    pageSize?: number;
//    pageSizeOptions?: ReadonlyArray<number>;
//    onPageChange?: (nextPage: number) => void;
//    onPageSizeChange?: (nextPageSize: number) => void;
// }

// export type Handle_Search_Change = (event: ChangeEvent<HTMLInputElement>) => void;
// export type Handle_Select_Change = (event: ChangeEvent<HTMLSelectElement>) => void;
// export type Handle_Page_Change = (nextPage: number) => void;
