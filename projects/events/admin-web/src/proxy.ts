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

   if (data.user && !isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_BASE.ADMIN;

      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));

      return redirectRes;
   }

   return supabaseResponse;
}

export default proxy;
