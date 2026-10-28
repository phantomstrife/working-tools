import { isValidPath } from './helpers';

const BASE = {
   AUTHORIZE: '',
   ADMIN: '/admin',
   SUPER_ADMIN: '/super-admin',
   GUARD: '/guard',
   OPERATOR: '/operator',
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
   GUARD: {
      HOME: `${BASE.GUARD}`,
   },
   OPERATOR: {
      HOME: `${BASE.OPERATOR}`,
   },
};

export const IS_ROUTE = {
   AUTHORIZE: (path: string): boolean => isValidPath(path, ROUTE.AUTHORIZE),
   ADMIN: (path: string): boolean => isValidPath(path, ROUTE.ADMIN),
   SUPER_ADMIN: (path: string): boolean =>
      isValidPath(path, [ROUTE.SUPER_ADMIN, ROUTE.ADMIN, ROUTE.GUARD, ROUTE.OPERATOR]),
   GUARD: (path: string): boolean => isValidPath(path, ROUTE.GUARD),
   OPERATOR: (path: string): boolean => isValidPath(path, ROUTE.OPERATOR),
};
