import { ROUTE } from './constants';

export const resolveHomeRoute = (role: ClientApp.Database.Account_Role): string => {
   switch (role) {
      case 'FIELD_STAFF': {
         return ROUTE.OPERATOR.HOME;
      }

      case 'GUARD':
      case 'SUPER_ADMIN':
      default: {
         return ROUTE.GUARD.HOME;
      }
   }
};
