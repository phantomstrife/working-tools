import { NextResponse } from 'next/server';

import { ROUTE, IS_ROUTE } from '@admin-web/routes/constants';
import { useServicesUserRead } from '@admin-web/services/user/read/server';

export const config = {
   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function proxy(request: AdminWeb.Router.Proxy_Request) {
   const currentPath = request.nextUrl.pathname;

   if (
      currentPath.startsWith('/_next') ||
      currentPath.startsWith('/api') ||
      currentPath.startsWith('/assets') ||
      currentPath.startsWith('/favicon') ||
      currentPath.match(/\.(.*)$/)
   ) {
      return NextResponse.next();
   }

   const response = NextResponse.next({
      request,
   });

   const serviceUserRead = await useServicesUserRead();
   let redirectUrl: string | null = null;

   if (serviceUserRead.error && !IS_ROUTE.AUTHORIZE(currentPath)) {
      redirectUrl = ROUTE.AUTHORIZE.LOGIN;
   }

   if (!serviceUserRead.error && serviceUserRead.data.role) {
      switch (serviceUserRead.data.role) {
         case 'SUPER_ADMIN': {
            if (!IS_ROUTE.SUPER_ADMIN(currentPath)) {
               redirectUrl = ROUTE.SUPER_ADMIN.HOME;
            }
            break;
         }

         case 'ADMIN': {
            const adminCompanyPath = ROUTE.ADMIN.HOME(serviceUserRead.data.companyId);
            const isOwnCompanyAdminRoute =
               Boolean(serviceUserRead.data.companyId) &&
               (currentPath === adminCompanyPath || currentPath.startsWith(`${adminCompanyPath}/`));

            if (!isOwnCompanyAdminRoute && !IS_ROUTE.GUARD(currentPath) && !IS_ROUTE.OPERATOR(currentPath)) {
               redirectUrl = adminCompanyPath;
            }
            break;
         }

         case 'FIELD_STAFF': {
            if (!IS_ROUTE.OPERATOR(currentPath)) {
               redirectUrl = ROUTE.OPERATOR.HOME;
            }
            break;
         }

         case 'GUARD': {
            if (!IS_ROUTE.GUARD(currentPath)) {
               redirectUrl = ROUTE.GUARD.HOME;
            }
            break;
         }
      }
   }

   if (redirectUrl) {
      const url = request.nextUrl.clone();
      url.pathname = redirectUrl;

      const redirect = NextResponse.redirect(url);
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));

      return redirect;
   }

   return response;
}

export default proxy;
