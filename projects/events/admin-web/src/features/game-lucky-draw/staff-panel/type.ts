import type { Ref } from 'react';
import type * as StaffSearchTypes from '@admin-web/services/game/staff-search/type';

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
   staff: StaffMember[];
   totalCount: number;
   page: number;
   pageSize: number;
   search: string;
   debouncedSearch: string;
   filter: Filter;
   isLoading: boolean;
   targetStaff: StaffMember | null;
   isUnassigning: boolean;
}

export type StaffMember = StaffSearchTypes.StaffMember;
export type Filter = AdminWeb.Features.GameLuckyDraw.Staff.Filter;

export type HandleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type HandleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type HandlePageChange = (nextPage: number) => void;
export type HandlePageSizeChange = (nextPageSize: number) => void;

