import type { ChangeEvent } from 'react';

export type AttendantFilter = 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'WINNER' | 'NOT_WINNER';

export interface AttendantItem {
   id: string;
   full_name: string;
   phone: string | null;
   email: string | null;
   ticket_code: string;
   is_checked_in: boolean;
   has_won: boolean;
}

export interface Properties {
   attendants: AttendantItem[];
   onImportCsv?: () => void;
   onSendEmails?: () => void;
   onExportWinners?: () => void;
   onCreate?: () => void;
   onEdit?: (item: AttendantItem) => void;
   onDelete?: (item: AttendantItem) => void;
}

export type Handle_Search_Change = (event: ChangeEvent<HTMLInputElement>) => void;
export type Handle_Filter_Change = (event: ChangeEvent<HTMLSelectElement>) => void;
export type Handle_Limit_Change = (event: ChangeEvent<HTMLSelectElement>) => void;
