export const SALUTATION_OPTIONS: readonly AdminWeb.Features.GameLuckyDraw.Attendant.Salutation[] = [
   'Anh',
   'Chị',
   'Ông',
   'Bà',
] as const;

export const SALUTATION_ALIAS_KEYS = new Set(['salutation', 'danh_xung', 'danh_xưng', 'xưng_hô', 'xung_ho']);

export const REPRESENTATIVE_SALUTATION_ALIAS_KEYS = new Set([
   'representative_salutation',
   'danh_xung_dai_dien',
   'danh_xưng_đại_diện',
   'danh_xung_nguoi_dai_dien',
   'danh_xưng_người_đại_diện',
]);

export const normalizeSalutation = (
   rawValue: string | null | undefined,
): AdminWeb.Features.GameLuckyDraw.Attendant.Salutation | null | 'invalid' => {
   if (rawValue === null || rawValue === undefined) {
      return null;
   }

   const trimmed = rawValue.trim();

   if (!trimmed) {
      return null;
   }

   const lowered = trimmed.toLowerCase();
   const matched = SALUTATION_OPTIONS.find((option) => option.toLowerCase() === lowered);

   return matched ?? 'invalid';
};

export const STANDARD_CSV_COLUMNS = [
   'citizen_id',
   'salutation',
   'full_name',
   'ticket_code',
   'email',
   'phone',
   'company_name',
   'department',
   'representative_salutation',
   'representative',
   'representative_phone',
   'sale_in_charge',
   'accommodation',
] as const;

export const BATCH_CHUNK_SIZE = 200;
export const FETCH_PAGE_SIZE = 1000;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
