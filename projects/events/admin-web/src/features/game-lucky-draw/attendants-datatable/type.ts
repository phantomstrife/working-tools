export interface Properties {
   gameId: string;
   isLoading?: boolean;
   onImportCsv?: () => void;
   onSendEmails?: () => void;
   onExportWinners?: () => void;
   onCreate?: () => void;
   onEdit?: (attendant: Attendant) => void;
   onDelete?: (attendant: Attendant) => void;
}

export interface State {
   attendants: Attendant[];
   totalCount: number;
   page: number;
   pageSize: number;
   search: string;
   debouncedSearch: string;
   filter: Filter;
   isLoading: boolean;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type Filter = AdminWeb.Features.GameLuckyDraw.Attendant.Filter;

export type HandleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type HandleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type HandlePageChange = (nextPage: number) => void;
export type HandlePageSizeChange = (nextPageSize: number) => void;
