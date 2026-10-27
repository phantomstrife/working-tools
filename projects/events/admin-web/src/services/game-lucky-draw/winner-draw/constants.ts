export const ALLOWED_ROLES: AdminWeb.Database.Account_Role[] = ['FIELD_STAFF', 'SUPER_ADMIN'];

export const PRIZE_COLUMNS = [
   'id',
   'game_id',
   'name',
   'description',
   'image_url',
   'tier_order',
   'total_quantity',
   'remaining_quantity',
   //
].join(', ');

export const ATTENDANT_COLUMNS = [
   'id',
   'full_name',
   'ticket_code',
   'email',
   'phone',
   'company_name',
   'department',
   'has_won',
   'custom_metadata',
   //
].join(', ');

