import { LucideIcon } from 'lucide-react';

export interface Properties<T> {
   title: ReactNode;
   totalCount?: number;
   rowKey?: keyof T | ((row: T) => string);
   tools?: Tool<T>[];
   searchTool?: SearchTool;
   filterTools?: FilterTool[];
   data: T[];
   columns: Column<T>[];
   pagination?: Pagination;
   isLoading?: boolean;
}

export interface State<T> {
   page: number;
   pageSize: number;
   selectedMap: Record<string, T>;
}

export type ReactNode = AdminWeb.ReactNode;

export interface Option {
   label: string;
   options: { label: string; value: string }[];
}

export interface BaseTool {
   key: string;
   label: string;
   icon?: LucideIcon;
   variant?: 'primary' | 'secondary';
   disabled?: boolean;
}

export interface StandardTool extends BaseTool {
   batchSelect?: false;
   onClick: () => void;
}

export interface BatchSelectTool<T> extends BaseTool {
   batchSelect: true;
   onClick: (selectedRows: T[], clearSelection: () => void) => void | Promise<void>;
}

export type Tool<T = unknown> = StandardTool | BatchSelectTool<T>;

export interface SearchTool {
   placeholder: string;
   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FilterTool {
   options: Option[];
   onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface Column<T> {
   key: string;
   header: ReactNode;
   align?: 'left' | 'center' | 'right';
   emphasis?: boolean;
   render?: (row: T, index: number) => ReactNode;
}

export interface Pagination {
   page: number;
   pageSize: number;
   onPageChange?: (nextPage: number) => void;
   onPageSizeChange?: (nextPageSize: number) => void;
}
