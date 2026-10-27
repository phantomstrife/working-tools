import type { z } from 'zod';

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

