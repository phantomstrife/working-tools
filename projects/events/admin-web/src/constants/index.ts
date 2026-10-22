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
   },
};
