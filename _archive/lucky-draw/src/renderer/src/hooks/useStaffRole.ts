import { useEffect, useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

export type StaffRole = 'admin' | 'guard';
export interface StaffProfile {
   role: StaffRole;
   full_name: string;
}

// Looks up the logged-in user's role in the `staff` table.
// `staff` is null when the account has no row or has been deactivated.
export function useStaffRole(userId: string | undefined) {
   const [staff, setStaff] = useState<StaffProfile | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      if (!userId) return;
      let cancelled = false;
      setLoading(true);

      supabase
         .from('staff')
         .select('role, full_name, active')
         .eq('user_id', userId)
         .maybeSingle()
         .then(({ data, error }) => {
            if (cancelled) return;
            if (error) setError(error.message);
            setStaff(data && data.active ? { role: data.role, full_name: data.full_name } : null);
            setLoading(false);
         });

      return () => {
         cancelled = true;
      };
   }, [userId]);

   return { staff, loading, error };
}

