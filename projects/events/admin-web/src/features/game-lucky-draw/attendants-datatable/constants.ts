export const MODAL_ID = {
   ATTENDANT_FORM: 'lucky-draw-attendant-form-modal',
   IMPORT_CSV: 'lucky-draw-attendant-import-modal',
   DELETE_ATTENDANT: 'lucky-draw-attendant-delete-modal',
   SEND_ALL_EMAILS: 'lucky-draw-attendant-send-all-emails-modal',
} as const;

export const isAbsentForfeited = (metadata: unknown): boolean => {
   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      return false;
   }

   return Boolean((metadata as Record<string, unknown>).is_absent_forfeited);
};

