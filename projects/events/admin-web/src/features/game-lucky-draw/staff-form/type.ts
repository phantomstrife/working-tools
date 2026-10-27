import type { z } from 'zod';

import type * as CandidateTypes from '@admin-web/services/game/staff-candidates/type';
import type * as StaffSearchTypes from '@admin-web/services/game/staff-search/type';

import type { assignSchema, editSchema } from './constants';

export interface Properties {
   gameId: string;
   staff?: StaffMember | null;
   onSuccess?: () => void;
   onCancel?: () => void;
}

export interface State {
   candidates: Candidate[];
   isLoadingCandidates: boolean;
}

export type StaffMember = StaffSearchTypes.StaffMember;
export type Candidate = CandidateTypes.CandidateAccount;
export type AssignFormValues = z.infer<typeof assignSchema>;
export type EditFormValues = z.infer<typeof editSchema>;
export type Mode = 'assign' | 'edit';

