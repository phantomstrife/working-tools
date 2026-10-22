export const ROUTE_BASE = {
   MAIN: '',
   AUTHORIZE: '',
   ADMIN: '/admin',
};

export const ROUTE = {
   MAIN: {
      HOME: `${ROUTE_BASE.MAIN}/`,
   },
   AUTHORIZE: {
      LOGIN: `${ROUTE_BASE.AUTHORIZE}/login`,
      FORGET_PASSWORD: `${ROUTE_BASE.AUTHORIZE}/forget-password`,
   },
   ADMIN: {
      DASHBOARD: `${ROUTE_BASE.ADMIN}/dashboard`,
      COMPANY: {
         SEARCH: `${ROUTE_BASE.ADMIN}/company/search`,
         CREATE: `${ROUTE_BASE.ADMIN}/company/create`,
         UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/company/update/${id}`,
      },
      ACCOUNT: {
         SEARCH: `${ROUTE_BASE.ADMIN}/account/search`,
         CREATE: `${ROUTE_BASE.ADMIN}/account/create`,
         UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/account/update/${id}`,
      },
      EVENT: {
         SEARCH: `${ROUTE_BASE.ADMIN}/event/search`,
         CREATE: `${ROUTE_BASE.ADMIN}/event/create`,
         UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/event/update/${id}`,
      },
      GAME: {
         SEARCH: `${ROUTE_BASE.ADMIN}/game/search`,
         CREATE: `${ROUTE_BASE.ADMIN}/game/create`,
         UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/game/update/${id}`,
      },
      LUCKY_DRAW: {
         PRIZE: {
            SEARCH: `${ROUTE_BASE.ADMIN}/lucky-draw/prize/search`,
            CREATE: `${ROUTE_BASE.ADMIN}/lucky-draw/prize/create`,
            UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/lucky-draw/prize/update/${id}`,
         },
         ATTENDANT: {
            SEARCH: `${ROUTE_BASE.ADMIN}/lucky-draw/attendant/search`,
            CREATE: `${ROUTE_BASE.ADMIN}/lucky-draw/attendant/create`,
            UPDATE: (id: string) => `${ROUTE_BASE.ADMIN}/lucky-draw/attendant/update/${id}`,
         },
         WINNER: {
            SEARCH: `${ROUTE_BASE.ADMIN}/lucky-draw/winner/search`,
         },
      },
   },
};
