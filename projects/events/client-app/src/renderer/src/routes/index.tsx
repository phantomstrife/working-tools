import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { LayoutAuthorize } from '@client-app/layouts/authorize';
import { LayoutVenue } from '@client-app/layouts/venue';
import { PageAuthorizeLogin } from '@client-app/routes/authorize/login';
import { ROUTE } from '@client-app/routes/constants';
import { PageGuardHome } from '@client-app/routes/guard/home';
import { resolveHomeRoute } from '@client-app/routes/helpers';
import { PageOperatorHome } from '@client-app/routes/operator/home';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const AppRouter: ClientApp.Router.Page = () => {
   const { param } = useLogic();
   const { loader } = useStyle;

   if (param.status === 'LOADING') {
      return (
         <div className={loader.wrapper}>
            <div className={loader.spinner} />
         </div>
      );
   }

   const isAuthenticated = param.status === 'AUTHENTICATED' && param.account !== null;
   const role = param.account?.role;
   const homePath = role ? resolveHomeRoute(role) : ROUTE.AUTHORIZE.LOGIN;

   const canAccessGuard = role === 'GUARD' || role === 'SUPER_ADMIN';
   const canAccessOperator = role === 'FIELD_STAFF' || role === 'SUPER_ADMIN';

   return (
      <HashRouter>
         <Routes>
            <Route element={<LayoutAuthorize />}>
               <Route
                  path={ROUTE.AUTHORIZE.LOGIN}
                  element={
                     isAuthenticated ? (
                        <Navigate
                           to={homePath}
                           replace
                        />
                     ) : (
                        <PageAuthorizeLogin />
                     )
                  }
               />
            </Route>

            <Route
               element={
                  isAuthenticated ? (
                     <LayoutVenue />
                  ) : (
                     <Navigate
                        to={ROUTE.AUTHORIZE.LOGIN}
                        replace
                     />
                  )
               }
            >
               <Route
                  path={ROUTE.GUARD.HOME}
                  element={
                     canAccessGuard ? (
                        <PageGuardHome />
                     ) : (
                        <Navigate
                           to={homePath}
                           replace
                        />
                     )
                  }
               />
            </Route>

            <Route
               path={ROUTE.OPERATOR.HOME}
               element={
                  !isAuthenticated ? (
                     <Navigate
                        to={ROUTE.AUTHORIZE.LOGIN}
                        replace
                     />
                  ) : canAccessOperator ? (
                     <PageOperatorHome />
                  ) : (
                     <Navigate
                        to={homePath}
                        replace
                     />
                  )
               }
            />

            <Route
               path="*"
               element={
                  <Navigate
                     to={isAuthenticated ? homePath : ROUTE.AUTHORIZE.LOGIN}
                     replace
                  />
               }
            />
         </Routes>
      </HashRouter>
   );
};
