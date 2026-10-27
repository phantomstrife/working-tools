import { LucideIcon } from 'lucide-react';

export interface Properties<T> {
   title: ReactNode;
   totalCount?: number;
   tools?: Tool[];
   searchTool?: SearchTool;
   filterTools?: FilterTool[];
   data: T[];
   columns: Column<T>[];
   pagination?: Pagination;
   isLoading?: boolean;
}

export interface State {
   page: number;
   pageSize: number;
}

export type ReactNode = AdminWeb.ReactNode;

export interface Option {
   label: string;
   options: { label: string; value: string }[];
}

export interface Tool {
   key: string;
   label: string;
   icon?: LucideIcon;
   variant?: 'primary' | 'secondary';
   disabled?: boolean;
   onClick: () => void;
}

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
