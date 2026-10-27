import { useEffect, useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

import type { Session } from '@supabase/supabase-js';

export function useSession() {
   const [session, setSession] = useState<Session | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
         setSession(data.session);
         setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
         setSession(nextSession);
      });

      return () => sub.subscription.unsubscribe();
   }, []);

   return { session, loading };
}

