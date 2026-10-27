import type { z } from 'zod';

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

