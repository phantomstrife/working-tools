import type { z } from 'zod';

import type { schema } from './constants';

export interface Properties {
   events: EventWithGames[];
   defaultEventId?: string;
   game?: Game | null;
   onSuccess?: (game: Game) => void;
   onCancel?: () => void;
}

export type EventWithGames = AdminWeb.Database.EventWithGames;
export type Game = AdminWeb.Database.Game;
export type FormValues = z.infer<typeof schema>;
export type Mode = 'create' | 'edit';
