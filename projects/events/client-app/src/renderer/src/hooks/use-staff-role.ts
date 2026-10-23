import { useEffect, useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

import type { Database } from '@renderer/lib/database.types';

export type AccountRole = Database['public']['Enums']['account_role'];

export type StaffProfile = {
   id: string;
   role: AccountRole;
   full_name: string;
   email: string;
   company_id: string | null;
};

export function useStaffRole(userId: string | undefined) {
   const [staff, setStaff] = useState<StaffProfile | null>(null);
   const [loading, setLoading] = useState(Boolean(userId));
   const [error, setError] = useState('');

   useEffect(() => {
      if (!userId) {
         return;
      }

      let cancelled = false;

      supabase
         .from('accounts')
         .select('id, role, full_name, email, company_id, is_active')
         .eq('id', userId)
         .maybeSingle()
         .then(({ data, error: fetchError }) => {
            if (cancelled) return;
            if (fetchError) {
               setError(fetchError.message);
            }
            if (data && data.is_active !== false) {
               setStaff({
                  id: data.id,
                  role: data.role,
                  full_name: data.full_name,
                  email: data.email,
                  company_id: data.company_id,
               });
            } else {
               setStaff(null);
            }
            setLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [userId]);

   return { staff, loading, error };
}

