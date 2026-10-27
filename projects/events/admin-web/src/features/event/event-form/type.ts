import type { z } from 'zod';

import type { schema } from './constants';

export interface Properties {
   companyId?: string;
   event?: EventWithGames | null;
   onSuccess?: (event: EventWithGames) => void;
   onCancel?: () => void;
}

export type EventWithGames = AdminWeb.Database.EventWithGames;
export type FormValues = z.infer<typeof schema>;
export type Mode = 'create' | 'edit';
