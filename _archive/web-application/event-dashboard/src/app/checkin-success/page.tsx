'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
   const searchParams = useSearchParams();
   const name = searchParams.get('name') || 'Guest';

   return (
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
         <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
         <h1 className="text-2xl font-bold text-white mb-2">Check-in Confirmed!</h1>
         <p className="text-slate-300">
            Welcome, <span className="font-semibold text-emerald-400">{name}</span>.
         </p>
         <p className="text-slate-400 text-sm mt-4">
            Your pass has been verified. You are now entered into the event drawing!
         </p>
      </div>
   );
}

export default function CheckinSuccessPage() {
   return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
         <Suspense fallback={<div className="text-white">Loading pass...</div>}>
            <SuccessContent />
         </Suspense>
      </div>
   );
}
