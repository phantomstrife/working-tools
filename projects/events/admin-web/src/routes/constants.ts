import { isValidPath } from './helpers';

const BASE = {
   AUTHORIZE: '',
   ADMIN: '/admin',
   SUPER_ADMIN: '/super-admin',
};

export const ROUTE = {
   AUTHORIZE: {
      LOGIN: `${BASE.AUTHORIZE}/login`,
      FORGET_PASSWORD: `${BASE.AUTHORIZE}/forget-password`,
   },
   ADMIN: {
      HOME: (companyId: string) => `${BASE.ADMIN}/${companyId}`,
   },
   SUPER_ADMIN: {
      HOME: `${BASE.SUPER_ADMIN}`,
      COMPANY: {
         SEARCH: `${BASE.SUPER_ADMIN}/company/search`,
         CREATE: `${BASE.SUPER_ADMIN}/company/create`,
         UPDATE: (id: string) => `${BASE.SUPER_ADMIN}/company/update/${id}`,
      },
   },
};

export const IS_ROUTE = {
   AUTHORIZE: (path: string): boolean => isValidPath(path, ROUTE.AUTHORIZE),
   ADMIN: (path: string): boolean => isValidPath(path, ROUTE.ADMIN),
   SUPER_ADMIN: (path: string): boolean => isValidPath(path, [ROUTE.SUPER_ADMIN, ROUTE.ADMIN]),
};

// ACCOUNT: {
//    SEARCH: `${BASE.ADMIN}/account/search`,
//    CREATE: `${BASE.ADMIN}/account/create`,
//    UPDATE: (id: string) => `${BASE.ADMIN}/account/update/${id}`,
// },
// EVENT: {
//    SEARCH: `${BASE.ADMIN}/event/search`,
//    CREATE: `${BASE.ADMIN}/event/create`,
//    UPDATE: (id: string) => `${BASE.ADMIN}/event/update/${id}`,
// },
// GAME: {
//    SEARCH: `${BASE.ADMIN}/game/search`,
//    CREATE: `${BASE.ADMIN}/game/create`,
//    UPDATE: (id: string) => `${BASE.ADMIN}/game/update/${id}`,
// },
// LUCKY_DRAW: {
//    PRIZE: {
//       SEARCH: `${BASE.ADMIN}/lucky-draw/prize/search`,
//       CREATE: `${BASE.ADMIN}/lucky-draw/prize/create`,
//       UPDATE: (id: string) => `${BASE.ADMIN}/lucky-draw/prize/update/${id}`,
//    },
//    ATTENDANT: {
//       SEARCH: `${BASE.ADMIN}/lucky-draw/attendant/search`,
//       CREATE: `${BASE.ADMIN}/lucky-draw/attendant/create`,
//       UPDATE: (id: string) => `${BASE.ADMIN}/lucky-draw/attendant/update/${id}`,
//    },
//    WINNER: {
//       SEARCH: `${BASE.ADMIN}/lucky-draw/winner/search`,
//    },
// },
