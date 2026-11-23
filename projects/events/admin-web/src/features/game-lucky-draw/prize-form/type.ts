import type { z } from 'zod';

import type { Candidate } from '@admin-web/services/game-lucky-draw/prize-attendant-candidates/type';

import type { schema } from './constants';

export interface Properties {
   gameId: string;
   prize?: Prize | null;
   onSuccess?: (prize: Prize) => void;
   onCancel?: () => void;
}

export type Prize = AdminWeb.Database.GameLuckyDrawPrize;
export type FormValues = z.infer<typeof schema>;
export type Mode = 'create' | 'edit';
export type MoveDirection = 'up' | 'down';
export type AttendantCandidate = Candidate;
export type CandidateStatus = 'ELIGIBLE' | 'NOT_CHECKED_IN' | 'HAS_WON' | 'ABSENT' | 'INELIGIBLE' | 'MISSING';

export interface RankedCandidateItem {
   id: string;
   rank: number;
   ticketCode: string;
   displayName: string;
   representativeName: string | null;
   companyName: string | null;
   status: CandidateStatus;
}

export interface AvailableCandidateItem {
   id: string;
   ticketCode: string;
   displayName: string;
   representativeName: string | null;
   companyName: string | null;
   status: CandidateStatus;
}

export interface CandidatesState {
   items: AttendantCandidate[];
   isLoading: boolean;
   error: string;
   search: string;
}
