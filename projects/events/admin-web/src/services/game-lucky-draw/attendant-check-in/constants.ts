export const ALLOWED_ROLES: AdminWeb.Database.Account_Role[] = ['GUARD', 'SUPER_ADMIN'];

export const ATTENDANT_COLUMNS = [
   'id',
   'full_name',
   'ticket_code',
   'email',
   'phone',
   'company_name',
   'department',
   'is_checked_in',
   'checked_in_at',
   'check_in_method',
   //
].join(', ');

export const LOG_ACTION = {
   QR_SCAN: 'CHECKIN_QR_SCAN',
   MANUAL_SEARCH: 'CHECKIN_MANUAL_SEARCH',
} as const;

