import type { z } from 'zod';

import type { AttendantHistoryEntry } from '@admin-web/services/game-lucky-draw/attendant-history-search/type';

import type { schema } from './constants';

export interface Properties {
   gameId: string;
   attendant?: Attendant | null;
   onSuccess?: (attendant: Attendant) => void;
   onCancel?: () => void;
}

export type Attendant = AdminWeb.Database.GameLuckyDrawAttendant;
export type FormValues = z.infer<typeof schema>;
export type Mode = 'create' | 'edit';
export type Tab = 'info' | 'history';
export type HistoryEntry = AttendantHistoryEntry;

export interface HistoryState {
   activeTab: Tab;
   isLoading: boolean;
   entries: HistoryEntry[];
   loadedAttendantId: string;
   error: string;
}
