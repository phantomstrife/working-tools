import { NextResponse } from 'next/server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { ROUTE, IS_ROUTE } from '@admin-web/routes/constants';

export const config = {
   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function proxy(request: Proxy_Request) {
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

   const supabase = await getServerClient(response);
   const auth = await supabase.auth.getUser();

   const user = auth.data.user;
   const role = user ? (user.app_metadata.role as Role) : null;

   let redirectUrl: string | null = null;

   if (!user && !IS_ROUTE.AUTHORIZE(currentPath)) {
      redirectUrl = ROUTE.AUTHORIZE.LOGIN;
   }

   if (user && role) {
      switch (role) {
         case 'SUPER_ADMIN': {
            if (!IS_ROUTE.SUPER_ADMIN(currentPath)) {
               redirectUrl = ROUTE.SUPER_ADMIN.HOME;
            }
            break;
         }

         case 'ADMIN': {
            // Todo: Get companyId from user metadata
            if (!IS_ROUTE.ADMIN(currentPath)) {
               redirectUrl = ROUTE.ADMIN.HOME('');
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
