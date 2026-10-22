/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { ArrowLeft, Upload, UserPlus, Download, X, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';

type StaffRow = {
   user_id: string;
   email: string;
   full_name: string;
   role: 'admin' | 'guard';
   active: boolean;
   created_at: string;
};

type Created = { email: string; full_name: string; role: string; password: string; generated: boolean };
type Failed = { email: string; reason: string };

const inputClass =
   'w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

async function api(method: string, body?: unknown) {
   const {
      data: { session },
   } = await supabase.auth.getSession();
   const res = await fetch('/api/staff', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: body ? JSON.stringify(body) : undefined,
   });
   const json = await res.json();
   if (!res.ok) throw new Error(json.error ?? 'Request failed');
   return json;
}

function StaffManager() {
   const [staff, setStaff] = useState<StaffRow[]>([]);
   const [loading, setLoading] = useState(true);
   const [form, setForm] = useState({ email: '', full_name: '', role: 'guard', password: '' });
   const [busy, setBusy] = useState(false);
   const [result, setResult] = useState<{ created: Created[]; failed: Failed[] } | null>(null);

   // Password reset modal state (replaces prompt)
   const [resetTarget, setResetTarget] = useState<StaffRow | null>(null);
   const [newPassword, setNewPassword] = useState('');
   const [resetting, setResetting] = useState(false);

   // Toast notifications (replaces alert)
   const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
   const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

   const notify = useCallback((kind: 'success' | 'error', text: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ kind, text });
      toastTimer.current = setTimeout(() => setToast(null), 4500);
   }, []);

   const load = useCallback(async () => {
      try {
         setStaff((await api('GET')).staff);
      } catch (err) {
         notify('error', 'Could not load staff: ' + (err as Error).message);
      } finally {
         setLoading(false);
      }
   }, [notify]);

   useEffect(() => {
      load();
   }, [load]);

   const createAccounts = async (rows: Record<string, string>[]) => {
      setBusy(true);
      try {
         const res = await api('POST', { staff: rows });
         setResult(res);
         if (res.created?.length) {
            notify('success', `Created ${res.created.length} staff account(s).`);
         }
         await load();
      } catch (err) {
         notify('error', 'Failed: ' + (err as Error).message);
      } finally {
         setBusy(false);
      }
   };

   const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      await createAccounts([form]);
      setForm({ email: '', full_name: '', role: 'guard', password: '' });
   };

   const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file) return;
      Papa.parse<Record<string, string>>(file, {
         header: true,
         skipEmptyLines: true,
         transformHeader: (h) => h.trim().toLowerCase(),
         complete: async (results) => {
            const rows = results.data.map((r) => ({
               email: r.email ?? '',
               full_name: r.full_name || r.name || '',
               role: r.role || 'guard',
               password: r.password ?? '',
            }));
            await createAccounts(rows);
            input.value = '';
         },
      });
   };

   const update = async (userId: string, patch: Record<string, unknown>, successMsg?: string) => {
      try {
         await api('PATCH', { userId, ...patch });
         if (successMsg) notify('success', successMsg);
         await load();
      } catch (err) {
         notify('error', 'Failed: ' + (err as Error).message);
      }
   };

   const handleResetPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!resetTarget || newPassword.length < 8) return;
      setResetting(true);
      await update(resetTarget.user_id, { password: newPassword }, `Password updated for ${resetTarget.email}.`);
      setResetting(false);
      setResetTarget(null);
      setNewPassword('');
   };

   const downloadCredentials = () => {
      if (!result) return;
      const csv = Papa.unparse(
         result.created.map(({ email, full_name, role, password }) => ({ email, full_name, role, password })),
      );
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff-credentials.csv';
      a.click();
      URL.revokeObjectURL(url);
   };

   return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8 space-y-8">
         {toast && (
            <div
               className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${
                  toast.kind === 'success'
                     ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                     : 'bg-red-950/90 border-red-800 text-red-200'
               }`}
            >
               {toast.kind === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
               ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
               )}
               <span>{toast.text}</span>
               <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
                  <X className="w-4 h-4" />
               </button>
            </div>
         )}

         <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Staff Accounts</h1>
               <p className="text-slate-400 text-sm mt-1">
                  Guards sign in to the Lucky Draw app and use the Gate screen to check guests in.
               </p>
            </div>
            <Link
               href="/"
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
            >
               <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAdd} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
               <h2 className="font-semibold flex items-center gap-2 text-white">
                  <UserPlus className="w-4 h-4 text-indigo-400" /> Add Staff Account
               </h2>
               <input
                  type="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
               />
               <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputClass}
               />
               <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClass}
               >
                  <option value="guard">Guard (Gate screen only)</option>
                  <option value="admin">Admin (full access)</option>
               </select>
               <input
                  type="text"
                  placeholder="Password (leave empty to auto-generate)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} font-mono`}
               />
               <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
               >
                  {busy ? 'Creating...' : 'Create Account'}
               </button>
               <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" /> Import Staff CSV
                  <input type="file" accept=".csv" onChange={handleCSV} disabled={busy} className="hidden" />
               </label>
               <p className="text-xs text-slate-400">
                  CSV columns: <code className="text-indigo-400">email</code>,{' '}
                  <code className="text-indigo-400">full_name</code>, <code className="text-indigo-400">role</code>,{' '}
                  <code className="text-indigo-400">password</code> (optional).
               </p>
            </form>

            <div className="lg:col-span-2 space-y-4">
               {result && (
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
                     <div className="flex items-center justify-between">
                        <h2 className="font-semibold tabular-nums">
                           Created {result.created.length}, failed {result.failed.length}
                        </h2>
                        {result.created.length > 0 && (
                           <button
                              onClick={downloadCredentials}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                           >
                              <Download className="w-3.5 h-3.5" /> Download credentials CSV
                           </button>
                        )}
                     </div>
                     {result.created.length > 0 && (
                        <p className="text-xs text-yellow-300">
                           Passwords are shown only once. Download or copy them before leaving this page.
                        </p>
                     )}
                     <ul className="text-sm space-y-1">
                        {result.created.map((c) => (
                           <li key={c.email} className="flex justify-between gap-4">
                              <span>{c.email}</span>
                              <span className="font-mono text-indigo-300">{c.password}</span>
                           </li>
                        ))}
                        {result.failed.map((f, i) => (
                           <li key={i} className="text-red-400">
                              {f.email || '(no email)'}: {f.reason}
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                           <th className="p-4">Name</th>
                           <th className="p-4">Email</th>
                           <th className="p-4">Role</th>
                           <th className="p-4">Active</th>
                           <th className="p-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700/70 text-sm">
                        {loading ? (
                           <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400">
                                 Loading staff accounts...
                              </td>
                           </tr>
                        ) : (
                           staff.map((s) => (
                              <tr key={s.user_id} className={`hover:bg-slate-700/40 transition-colors ${s.active ? '' : 'opacity-50'}`}>
                                 <td className="p-4 text-white font-medium">{s.full_name}</td>
                                 <td className="p-4 text-slate-300">{s.email}</td>
                                 <td className="p-4">
                                    <select
                                       value={s.role}
                                       onChange={(e) => update(s.user_id, { role: e.target.value }, 'Role updated.')}
                                       className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    >
                                       <option value="guard">Guard</option>
                                       <option value="admin">Admin</option>
                                    </select>
                                 </td>
                                 <td className="p-4">
                                    <input
                                       type="checkbox"
                                       checked={s.active}
                                       onChange={(e) =>
                                          update(
                                             s.user_id,
                                             { active: e.target.checked },
                                             e.target.checked ? 'Account activated.' : 'Account deactivated.',
                                          )
                                       }
                                       className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                                    />
                                 </td>
                                 <td className="p-4 text-right">
                                    <button
                                       onClick={() => {
                                          setResetTarget(s);
                                          setNewPassword('');
                                       }}
                                       className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                    >
                                       <KeyRound className="w-3.5 h-3.5" /> Reset password
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Reset Password Modal */}
         {resetTarget && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <form
                  onSubmit={handleResetPasswordSubmit}
                  className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4"
               >
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-bold text-white">Reset Password</h2>
                     <button
                        type="button"
                        onClick={() => setResetTarget(null)}
                        className="text-slate-400 hover:text-white"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <p className="text-xs text-slate-400">
                     Set a new password for <span className="text-white font-medium">{resetTarget.email}</span> (minimum
                     8 characters).
                  </p>
                  <input
                     type="text"
                     required
                     minLength={8}
                     autoFocus
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     placeholder="New password (min 8 chars)"
                     className={`${inputClass} font-mono`}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() => setResetTarget(null)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={resetting || newPassword.length < 8}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                     >
                        {resetting ? 'Updating...' : 'Update Password'}
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
}

export default function StaffPage() {
   return (
      <AuthGuard>
         <StaffManager />
      </AuthGuard>
   );
}
