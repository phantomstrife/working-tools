import type { VipAttendantInfo } from '@admin-web/services/game-lucky-draw/vip-accommodation/type';

export type Action_Mode = 'loading' | 'confirmed' | 'edit' | 'error';

export interface Properties {
   initialToken: string;
   initialAction: string;
}

export interface FormValues {
   full_name: string;
   citizen_id?: string | null;
   email?: string | null;
   phone?: string | null;
}

export interface State {
   mode: Action_Mode;
   attendant: VipAttendantInfo | null;
   errorMessage: string;
   submitError: string;
   wasUpdated: boolean;
}
