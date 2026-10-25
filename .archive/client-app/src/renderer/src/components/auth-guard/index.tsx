import { LoginPage } from '@renderer/components/login-page';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { AuthGuardProps } from './use-logic';

export const AuthGuard = (props: AuthGuardProps) => {
   const { param } = useLogic(props);
   const { loadingScreen, loadingPill, pulseDot } = useStyle;

   if (param.loading) {
      return (
         <main className={loadingScreen()}>
            <div className={loadingPill()}>
               <span className={pulseDot()} />
               <span>Checking session...</span>
            </div>
         </main>
      );
   }

   if (!param.session) {
      return <LoginPage />;
   }

   return <>{param.children}</>;
};

