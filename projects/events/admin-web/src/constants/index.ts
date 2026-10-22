export const ROUTE_BASE = {
   MAIN: '/',
   AUTHORIZE: '/',
   ADMIN: '/admin',
};

export const ROUTE = {
   MAIN: {
      HOME: ROUTE_BASE.MAIN,
   },
   AUTHORIZE: {
      LOGIN: `${ROUTE_BASE.AUTHORIZE}/login`,
      FORGET_PASSWORD: `${ROUTE_BASE.AUTHORIZE}/forget-password`,
   },
   ADMIN: {
      DASHBOARD: `${ROUTE_BASE.ADMIN}/dashboard`,
      COMPANY: {
         DASHBOARD: (id: string) => `${ROUTE_BASE.ADMIN}/company/${id}`,
      },
   },
};

export const ROLE = {
   SUPER_ADMIN: 'super_admin',
   ADMIN: 'admin',
};
