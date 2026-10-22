import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { ROUTE, ROUTE_BASE } from '@/constants';

export const config = {
   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function proxy(request: NextRequest) {
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

   let supabaseResponse = NextResponse.next({
      request,
   });

   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
         cookies: {
            getAll() {
               return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
               cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
               supabaseResponse = NextResponse.next({
                  request,
               });
               cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
            },
         },
      },
   );

   const { data } = await supabase.auth.getUser();

   const isMainRoute = currentPath === ROUTE.MAIN.HOME;
   const isDashboardRoute = currentPath.startsWith(ROUTE_BASE.ADMIN);

   if (!data.user && (isMainRoute || isDashboardRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE.AUTHORIZE.LOGIN;

      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));

      return redirectRes;
   }

   if (data.user) {
      const account = await supabase
         .from('accounts')
         .select('role')
         .eq('id', data.user.id)
         .single();

      const role = account.data?.role;
      const defaultAdminLanding =
         role === 'SUPER_ADMIN' ? ROUTE.ADMIN.COMPANY.SEARCH : ROUTE.ADMIN.EVENT.SEARCH;

      if (!isDashboardRoute || currentPath === ROUTE_BASE.ADMIN) {
         const url = request.nextUrl.clone();
         url.pathname = defaultAdminLanding;

         const redirectRes = NextResponse.redirect(url);
         supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));

         return redirectRes;
      }

      if (role !== 'SUPER_ADMIN' && currentPath.startsWith(`${ROUTE_BASE.ADMIN}/company`)) {
         const url = request.nextUrl.clone();
         url.pathname = ROUTE.ADMIN.EVENT.SEARCH;

         const redirectRes = NextResponse.redirect(url);
         supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));

         return redirectRes;
      }
   }

   return supabaseResponse;
}

export default proxy;
