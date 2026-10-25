import type { ReactNode } from 'react';

export interface DataTableColumn<TRow> {
   key: string;
   header: string;
   renderCell: (row: TRow) => ReactNode;
}

export interface DataTableEmptyStateConfig {
   icon?: ReactNode;
   hasActiveFilters: boolean;
   filteredTitle?: string;
   filteredDescription?: string;
   emptyTitle: string;
   emptyDescription: string;
   createLabel: string;
   onClearFilters: () => void;
   onCreateFirst: () => void;
}

export interface DataTablePaginationConfig {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
   rangeStart: number;
   rangeEnd: number;
   pageSizeOptions?: ReadonlyArray<number>;
   onPageChange: (page: number) => void;
   onLimitChange: (limit: string) => void;
}

export interface DataTableProps<TRow> {
   columns: ReadonlyArray<DataTableColumn<TRow>>;
   items: ReadonlyArray<TRow>;
   isLoading: boolean;
   skeletonRowCount?: number;
   getRowId: (row: TRow) => string;
   getRowLabel?: (row: TRow) => string;
   selectedIds: ReadonlyArray<string>;
   isAllSelected: boolean;
   onToggleSelectAll: () => void;
   onToggleSelectRow: (id: string) => void;
   openMenuId: string | null;
   onToggleRowMenu: (id: string) => void;
   onCloseRowMenu: () => void;
   onEditRow?: (row: TRow) => void;
   onDuplicateRow?: (row: TRow) => void;
   onDeleteRow?: (row: TRow) => void;
   emptyState: DataTableEmptyStateConfig;
   pagination: DataTablePaginationConfig;
}

