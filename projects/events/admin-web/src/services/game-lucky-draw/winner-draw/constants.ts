export const ALLOWED_ROLES: AdminWeb.Database.Account_Role[] = [
   'FIELD_STAFF',
   'ADMIN',
   'SUPER_ADMIN',
];

export const ELIGIBLE_POOL_PAGE_SIZE = 1000;

export const PRIZE_COLUMNS = [
   'id',
   'game_id',
   'name',
   'description',
   'image_url',
   'tier_order',
   'total_quantity',
   'remaining_quantity',
   'designated_attendant_ids',
   //
].join(', ');

export const ATTENDANT_COLUMNS = [
   'id',
   'salutation',
   'full_name',
   'representative_salutation',
   'representative',
   'representative_phone',
   'ticket_code',
   'email',
   'phone',
   'company_name',
   'department',
   'has_won',
   'is_draw_eligible',
   'custom_metadata',
   //
].join(', ');
