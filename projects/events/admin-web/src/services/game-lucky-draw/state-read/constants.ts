export const PRIZE_COLUMNS = [
   'id',
   'name',
   'description',
   'image_url',
   'tier_order',
   'total_quantity',
   'remaining_quantity',
   //
].join(', ');

export const PARTICIPANT_COLUMNS = [
   'id',
   'full_name',
   'ticket_code',
   'company_name',
   'department',
   'has_won',
   'custom_metadata',
   //
].join(', ');

export const WINNER_COLUMNS = `
   id,
   prize_id,
   attendant_id,
   won_at,
   attendant:lucky_draw_attendants!lucky_draw_winners_attendant_id_fkey (
      id,
      full_name,
      ticket_code,
      company_name,
      department
   )
`;

