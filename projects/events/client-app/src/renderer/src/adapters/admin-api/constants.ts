export const ADMIN_API = {
   BASE_URL: (import.meta.env.VITE_ADMIN_API_URL ?? '').replace(/\/+$/, ''),
   PATH: {
      GAME_LUCKY_DRAW_CHECK_IN: '/api/game-lucky-draw/check-in',
   },
};
