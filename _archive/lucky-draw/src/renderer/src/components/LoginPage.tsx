import React, { useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

export const LoginPage: React.FC = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      setLoading(false);
      if (error) setError(error.message);
      // On success, onAuthStateChange in useSession updates the session
      // and AuthGuard re-renders the protected content automatically.
   };

   return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
         <form
            onSubmit={handleLogin}
            className="w-full max-w-sm flex flex-col gap-4 p-7 rounded-xl bg-slate-800 border border-slate-700 shadow-xl text-white"
         >
            <h1 className="text-xl font-bold text-yellow-400">Admin Login</h1>

            <label className="flex flex-col gap-1.5 text-sm">
               Email
               <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-yellow-500"
               />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
               Password
               <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-yellow-500"
               />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
               type="submit"
               disabled={loading}
               className="px-4 py-2.5 rounded-lg bg-yellow-500 text-slate-900 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
               {loading ? 'Signing in...' : 'Sign in'}
            </button>
         </form>
      </main>
   );
};
