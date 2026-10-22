import React, { useState } from 'react';
import { useSession } from '@renderer/hooks/useSession';
import { useStaffRole } from '@renderer/hooks/useStaffRole';
import { supabase } from '@renderer/lib/supabase';
import { LuckyDrawBoard } from '@renderer/components/LuckyDraw/theme-02';
import { EventLoader } from '@renderer/components/EventLoader';
import { GatePage } from '@renderer/components/Gate/GatePage';

const signOut = () => supabase.auth.signOut();

// Guards only get the Gate screen. Admins get the draw screen and can switch to the Gate.
export const RoleRouter: React.FC = () => {
   const { session } = useSession();
   const { staff, loading, error } = useStaffRole(session?.user.id);
   const [view, setView] = useState<'draw' | 'gate'>('draw');

   if (loading) {
      return (
         <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800">
               <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
               <span>Loading workspace...</span>
            </div>
         </main>
      );
   }

   if (!staff) {
      return (
         <main className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 text-slate-100">
            <div className="max-w-sm w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-center">
               <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/70 text-red-300 border border-red-800">
                  Access Restricted
               </div>
               <h1 className="text-xl font-bold text-white">No Staff Access</h1>
               <p className="text-sm text-slate-400">
                  {error
                     ? `Could not verify your role (${error}).`
                     : 'Your account is not an active staff account. Ask an administrator to enable your account.'}
               </p>
               <button
                  onClick={signOut}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
               >
                  Sign out
               </button>
            </div>
         </main>
      );
   }

   if (staff.role === 'guard') {
      return <GatePage fullName={staff.full_name} onSignOut={signOut} />;
   }

   if (view === 'gate') {
      return <GatePage fullName={staff.full_name} onSignOut={signOut} onBack={() => setView('draw')} />;
   }

   return (
      <>
         <LuckyDrawBoard />
         <EventLoader />
         <div className="fixed left-5 top-5 z-50 flex items-center gap-2 p-1.5 rounded-full bg-slate-900/85 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs text-slate-200 select-none">
            <span className="pl-2.5 pr-1 font-medium text-slate-300 truncate max-w-36" title={staff.full_name}>
               {staff.full_name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-950/80 text-yellow-300 border border-yellow-700/70">
               Admin
            </span>
            <button
               onClick={() => setView('gate')}
               className="rounded-full bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 px-3 py-1.5 font-semibold text-white border border-slate-700 transition-colors"
            >
               Gate Check-in
            </button>
            <button
               onClick={signOut}
               className="rounded-full px-3 py-1.5 font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
               Sign out
            </button>
         </div>
      </>
   );
};
