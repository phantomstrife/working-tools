// Bearer-token APIs (no cookies) consumed by [CLIENT_APP] (Electron renderer: dev http origin / prod file:// "null" origin).
export const CORS_HEADERS = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Authorization, Content-Type',
   'Access-Control-Max-Age': '86400',
};

export const ERROR_STATUS: Record<string, number> = {
   'services.user.unauthenticated': 401,
   'services.user.access_denied': 403,
   'services.account.deactivated': 403,
   'services.game_lucky_draw.check_in.game_not_assigned': 403,
   'services.game_lucky_draw.check_in.attendant_not_found': 404,
   'services.game_lucky_draw.draw.game_not_assigned': 403,
   'services.game_lucky_draw.draw.winner_not_found': 404,
   'services.game_lucky_draw.prize.not_found': 404,
   'services.game_lucky_draw.game_not_found': 404,
};

