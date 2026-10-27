import type { Ref } from 'react';

export interface ImperativeHandle {
   manualRefresh: () => Promise<void>;
}

export interface Properties {
   ref?: Ref<ImperativeHandle>;
   className?: string;
   gameId: string;
   isLoading?: boolean;
   onDataChange?: () => void;
}

export interface State {
   prizes: Prize[];
   totalCount: number;
   page: number;
   pageSize: number;
   search: string;
   debouncedSearch: string;
   filter: Filter;
   isLoading: boolean;
   targetPrize: Prize | null;
   isDeleting: boolean;
}

export type Prize = AdminWeb.Database.GameLuckyDrawPrize;
export type Filter = AdminWeb.Features.GameLuckyDraw.Prize.Filter;
export type StockStatus = AdminWeb.Features.GameLuckyDraw.Prize.StockStatus;

export type HandleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type HandleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type HandlePageChange = (nextPage: number) => void;
export type HandlePageSizeChange = (nextPageSize: number) => void;

