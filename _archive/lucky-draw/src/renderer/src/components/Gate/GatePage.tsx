import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@renderer/lib/supabase';
import { QrScanner } from './QrScanner';

interface GateRegistration {
   registration_id: string;
   event_id: string;
   event_title: string;
   name: string;
   email: string;
   phone: string | null;
   ticket_code: string;
   status: 'imported' | 'email_sent' | 'replied_scanned';
   scanned_at: string | null;
   checked_in_by_name: string | null;
   check_in_method: 'qr' | 'manual' | null;
}

type Method = 'qr' | 'manual';

interface Props {
   fullName: string;
   onSignOut: () => void;
   /** Admins can jump back to the draw screen. */
   onBack?: () => void;
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// The email QR holds `${SITE_URL}/api/checkin?r=<registrationId>`; a bare id works too.
export function extractRegistrationId(text: string): string | null {
   try {
      const r = new URL(text.trim()).searchParams.get('r');
      if (r && UUID_RE.test(r)) return r.match(UUID_RE)![0];
   } catch {
      // not a URL, fall through
   }
   return text.match(UUID_RE)?.[0] ?? null;
}

const selectClass =
   'w-full px-3 py-2 text-sm text-white bg-slate-900 border border-slate-600 rounded focus:outline-none focus:border-yellow-500 disabled:opacity-50';

const statusLabel: Record<GateRegistration['status'], string> = {
   imported: 'Imported',
   email_sent: 'Email sent',
   replied_scanned: 'Checked in',
};

export const GatePage: React.FC<Props> = ({ fullName, onSignOut, onBack }) => {
   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
   const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
   const [categoryId, setCategoryId] = useState('');
   const [eventId, setEventId] = useState('');

   const [query, setQuery] = useState('');
   const [results, setResults] = useState<GateRegistration[]>([]);
   const [searching, setSearching] = useState(false);

   // The guest waiting for the guard's confirmation, and how they were found
   const [pending, setPending] = useState<{ reg: GateRegistration; method: Method } | null>(null);
   const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
   const [confirming, setConfirming] = useState(false);

   useEffect(() => {
      supabase
         .from('categories')
         .select('id, name')
         .order('name')
         .then(({ data }) => setCategories(data || []));
   }, []);

   const handleCategory = async (id: string) => {
      setCategoryId(id);
      setEventId('');
      setEvents([]);
      setResults([]);
      setPending(null);
      if (!id) return;
      const { data } = await supabase.from('events').select('id, title').eq('category_id', id).order('title');
      setEvents(data || []);
   };

   const handleEvent = (id: string) => {
      setEventId(id);
      setResults([]);
      setQuery('');
      setPending(null);
      setNotice(null);
   };

   const lookup = useCallback(async (registrationId: string) => {
      const { data, error } = await supabase.rpc('lookup_registration', { p_registration_id: registrationId });
      if (error) throw error;
      return ((data as GateRegistration[]) ?? [])[0] ?? null;
   }, []);

   // QR scanned -> load the guest and ask for confirmation
   const handleScan = useCallback(
      async (text: string) => {
         const id = extractRegistrationId(text);
         if (!id) {
            setNotice({ kind: 'error', text: 'This QR code is not an event pass.' });
            return;
         }
         try {
            const reg = await lookup(id);
            if (!reg) {
               setNotice({ kind: 'error', text: 'Pass not found. It may be invalid or deleted.' });
               return;
            }
            setNotice(null);
            setPending({ reg, method: 'qr' });
         } catch (err) {
            setNotice({ kind: 'error', text: (err as Error).message });
         }
      },
      [lookup],
   );

   // Debounced search inside the selected event
   useEffect(() => {
      if (!eventId || !query.trim()) {
         setResults([]);
         return;
      }
      setSearching(true);
      const timer = setTimeout(async () => {
         const { data, error } = await supabase.rpc('search_registrations', {
            p_event_id: eventId,
            p_query: query,
         });
         if (error) setNotice({ kind: 'error', text: error.message });
         else setResults((data as GateRegistration[]) ?? []);
         setSearching(false);
      }, 300);
      return () => clearTimeout(timer);
   }, [query, eventId]);

   const wrongEvent = !!pending && pending.reg.event_id !== eventId;
   const alreadyIn = pending?.reg.status === 'replied_scanned';

   const confirmCheckin = async () => {
      if (!pending) return;
      setConfirming(true);
      const { data, error } = await supabase.rpc('confirm_checkin', {
         p_registration_id: pending.reg.registration_id,
         p_method: pending.method,
      });
      setConfirming(false);

      if (error) {
         setNotice({ kind: 'error', text: error.message });
         return;
      }
      const result = (data as { result: string }).result;
      if (result === 'checked_in') {
         setNotice({ kind: 'ok', text: `${pending.reg.name} checked in.` });
      } else if (result === 'already_checked_in') {
         setNotice({ kind: 'error', text: `${pending.reg.name} was already checked in.` });
      } else {
         setNotice({ kind: 'error', text: 'Pass not found.' });
      }
      setPending(null);
      // Refresh the search results so the status column is current
      if (query.trim()) setQuery((q) => q + ' ');
      setTimeout(() => setNotice((n) => (n?.kind === 'ok' ? null : n)), 4000);
   };

   const checkedInText = (r: GateRegistration) =>
      `${r.scanned_at ? new Date(r.scanned_at).toLocaleString() : ''}${
         r.checked_in_by_name ? ` by ${r.checked_in_by_name}` : ''
      }${r.check_in_method ? ` (${r.check_in_method})` : ''}`;

   return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
         <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
               <div>
                  <h1 className="text-2xl font-bold text-yellow-400">Gate Check-in</h1>
                  <p className="text-sm text-slate-400">Signed in as {fullName}</p>
               </div>
               <div className="flex gap-2">
                  {onBack && (
                     <button
                        onClick={onBack}
                        className="px-3 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600 font-semibold"
                     >
                        Back to draw
                     </button>
                  )}
                  <button
                     onClick={onSignOut}
                     className="px-3 py-2 text-sm rounded bg-slate-800 border border-slate-600 hover:bg-slate-700"
                  >
                     Sign out
                  </button>
               </div>
            </header>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
               <select value={categoryId} onChange={(e) => handleCategory(e.target.value)} className={selectClass}>
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                     <option key={c.id} value={c.id}>
                        {c.name}
                     </option>
                  ))}
               </select>
               <select
                  value={eventId}
                  onChange={(e) => handleEvent(e.target.value)}
                  disabled={!events.length}
                  className={selectClass}
               >
                  <option value="">-- Select Event --</option>
                  {events.map((e) => (
                     <option key={e.id} value={e.id}>
                        {e.title}
                     </option>
                  ))}
               </select>
            </div>

            {notice && (
               <div
                  className={`rounded-lg border p-3 text-sm font-semibold ${
                     notice.kind === 'ok'
                        ? 'border-emerald-700 bg-emerald-900/50 text-emerald-300'
                        : 'border-red-700 bg-red-900/40 text-red-300'
                  }`}
               >
                  {notice.text}
               </div>
            )}

            {!eventId ? (
               <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-500">
                  Select a category and event to start checking guests in.
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Scanner + confirmation */}
                  <section className="space-y-4">
                     <h2 className="text-sm font-bold uppercase text-slate-400">Scan QR code</h2>
                     <QrScanner onScan={handleScan} paused={!!pending} />

                     {pending && (
                        <div className="space-y-3 rounded-xl border border-yellow-600 bg-slate-800 p-4">
                           <div className="text-xl font-bold text-white">{pending.reg.name}</div>
                           <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                              <dt className="text-slate-400">Ticket</dt>
                              <dd className="font-mono text-yellow-300">{pending.reg.ticket_code}</dd>
                              <dt className="text-slate-400">Email</dt>
                              <dd className="truncate">{pending.reg.email}</dd>
                              <dt className="text-slate-400">Phone</dt>
                              <dd>{pending.reg.phone || '-'}</dd>
                              <dt className="text-slate-400">Event</dt>
                              <dd>{pending.reg.event_title}</dd>
                              <dt className="text-slate-400">Status</dt>
                              <dd>{statusLabel[pending.reg.status]}</dd>
                           </dl>

                           {wrongEvent && (
                              <p className="rounded bg-red-900/40 p-2 text-sm text-red-300">
                                 This pass is for another event ({pending.reg.event_title}). Select that event to check
                                 the guest in.
                              </p>
                           )}
                           {alreadyIn && (
                              <p className="rounded bg-red-900/40 p-2 text-sm text-red-300">
                                 Already checked in {checkedInText(pending.reg)}.
                              </p>
                           )}

                           <div className="flex gap-2">
                              <button
                                 onClick={confirmCheckin}
                                 disabled={confirming || wrongEvent || alreadyIn}
                                 className="flex-1 rounded bg-emerald-600 px-4 py-2.5 font-bold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                 {confirming ? 'Checking in...' : 'Confirm check-in'}
                              </button>
                              <button
                                 onClick={() => setPending(null)}
                                 className="rounded bg-slate-700 px-4 py-2.5 font-semibold hover:bg-slate-600"
                              >
                                 Cancel
                              </button>
                           </div>
                        </div>
                     )}
                  </section>

                  {/* Manual search */}
                  <section className="space-y-4">
                     <h2 className="text-sm font-bold uppercase text-slate-400">Search guest</h2>
                     <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Name, email, phone, ticket code..."
                        className={selectClass}
                     />
                     <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                        {!query.trim() ? (
                           <p className="p-6 text-center text-sm text-slate-500">Type to search this event.</p>
                        ) : searching && results.length === 0 ? (
                           <p className="p-6 text-center text-sm text-slate-500">Searching...</p>
                        ) : results.length === 0 ? (
                           <p className="p-6 text-center text-sm text-slate-500">No guest found.</p>
                        ) : (
                           <ul className="max-h-[55vh] divide-y divide-slate-700 overflow-y-auto">
                              {results.map((r) => (
                                 <li key={r.registration_id} className="flex items-center justify-between gap-3 p-3">
                                    <div className="min-w-0">
                                       <div className="truncate font-semibold text-white">{r.name}</div>
                                       <div className="truncate text-xs text-slate-400">
                                          {r.email} {r.phone ? `· ${r.phone}` : ''}
                                       </div>
                                       <div className="text-xs">
                                          <span className="font-mono text-yellow-300">{r.ticket_code}</span>
                                          <span
                                             className={`ml-2 ${
                                                r.status === 'replied_scanned' ? 'text-emerald-400' : 'text-slate-400'
                                             }`}
                                          >
                                             {statusLabel[r.status]}
                                          </span>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => {
                                          setNotice(null);
                                          setPending({ reg: r, method: 'manual' });
                                       }}
                                       className="shrink-0 rounded bg-yellow-500 px-3 py-1.5 text-sm font-bold text-slate-900 hover:bg-yellow-400"
                                    >
                                       Select
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </section>
               </div>
            )}
         </div>
      </div>
   );
};

