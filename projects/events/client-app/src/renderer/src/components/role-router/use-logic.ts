import { useState } from 'react';
import { useSession } from '@renderer/hooks/use-session';
import { useStaffRole } from '@renderer/hooks/use-staff-role';
import { supabase } from '@renderer/lib/supabase';
import { useDrawStore } from '@renderer/stores/lucky-draw';

export function useLogic() {
   const { session } = useSession();
   const { staff, loading, error } = useStaffRole(session?.user.id);
   const [view, setView] = useState<'draw' | 'gate'>('draw');

   const hideHud = useDrawStore((s) => s.hideHud);
   const setHideHud = useDrawStore((s) => s.setHideHud);
   const cleanupRealtime = useDrawStore((s) => s.cleanupRealtime);

   async function handleSignOut() {
      cleanupRealtime();
      await supabase.auth.signOut();
   }

   function handleOpenGate() {
      setView('gate');
   }

   function handleBackToDraw() {
      setView('draw');
   }

   function handleToggleHud() {
      setHideHud((v) => !v);
   }

   return {
      param: {
         staff,
         loading,
         error,
         view,
         hideHud,
      },
      func: {
         handleSignOut,
         handleOpenGate,
         handleBackToDraw,
         handleToggleHud,
      },
   };
}

