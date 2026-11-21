import type { z } from 'zod';

import type { VipAttendantInfo } from '@admin-web/services/game-lucky-draw/vip-accommodation/type';

import type { schema } from './constants';

export type Action_Mode = 'loading' | 'confirmed' | 'edit' | 'error';

export interface Properties {
   initialToken: string;
   initialAction: string;
}

export type Salutation = AdminWeb.Features.GameLuckyDraw.Attendant.Salutation;
export type FormValues = z.infer<typeof schema>;

export interface State {
   mode: Action_Mode;
   attendant: VipAttendantInfo | null;
   errorMessage: string;
   submitError: string;
   wasUpdated: boolean;
}
