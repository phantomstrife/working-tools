import { useEffect } from 'react';

import { supabase } from '@client-app/adapters/supabase';
import { useServicesAccountRead } from '@client-app/services/account/read';
import { useStoreSession } from '@client-app/store/session';

export function useLogic() {
   const status = useStoreSession((store) => store.status);
   const account = useStoreSession((store) => store.account);
   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);
   const setUnauthenticated = useStoreSession((store) => store.setUnauthenticated);

   useEffect(() => {
      let active = true;

      const hydrateSession = async () => {
         const serviceAccountRead = await useServicesAccountRead();

         if (!active) {
            return;
         }

         if (serviceAccountRead.error) {
            setUnauthenticated();
            return;
         }

         setAuthenticated(serviceAccountRead.data);
      };

      void hydrateSession();

      const { data: listener } = supabase.auth.onAuthStateChange((event) => {
         if (event === 'SIGNED_OUT') {
            setUnauthenticated();
         }
      });

      return () => {
         active = false;
         listener.subscription.unsubscribe();
      };
   }, [setAuthenticated, setUnauthenticated]);

   return {
      param: {
         status,
         account,
      },
   };
}

