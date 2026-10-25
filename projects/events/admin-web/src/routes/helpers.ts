// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidPath = (path: string, routes: any): boolean => {
   for (const key of Object.keys(routes)) {
      const value = routes[key];

      if (typeof value === 'object' && value !== null) {
         if (isValidPath(path, value)) {
            return true;
         }
      } else if (typeof value === 'string') {
         if (path === value) {
            return true;
         }
      } else if (typeof value === 'function') {
         const PLACEHOLDER = '__ID_PLACEHOLDER__';
         const templateRoute = value(PLACEHOLDER);

         const escapedRoute = templateRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
         const regexString = escapedRoute.replace(PLACEHOLDER, '([^/]+)');
         const regex = new RegExp(`^${regexString}$`);

         if (regex.test(path)) {
            return true;
         }
      }
   }

   return false;
};
