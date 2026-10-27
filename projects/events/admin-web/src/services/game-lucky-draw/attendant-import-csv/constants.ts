export const STANDARD_CSV_COLUMNS = [
   'full_name',
   'ticket_code',
   'email',
   'phone',
   'company_name',
   'department',
] as const;

export const BATCH_CHUNK_SIZE = 200;
export const FETCH_PAGE_SIZE = 1000;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

