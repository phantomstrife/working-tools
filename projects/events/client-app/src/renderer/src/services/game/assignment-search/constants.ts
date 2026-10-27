export const GAME_COLUMNS = `
   id,
   name,
   status,
   game_type,
   config,
   is_dev_only,
   event:events!games_event_id_fkey (
      id,
      name,
      location_name,
      start_time
   )
`;
