import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

import type { Database } from '@renderer/lib/database.types';

type CheckInMethod = Database['public']['Enums']['check_in_method_type'];

export type GateAttendant = {
   id: string;
   game_id: string;
   game_name: string;
   event_id: string;
   event_name: string;
   full_name: string;
   email: string;
   phone: string | null;
   company_name: string | null;
   department: string | null;
   ticket_code: string;
   qr_code_payload: string;
   is_checked_in: boolean;
   checked_in_at: string | null;
   check_in_method: CheckInMethod | null;
};

type Method = 'qr' | 'manual';

export type GatePageProps = {
   accountId: string;
   fullName: string;
   onSignOut: () => void;
   onBack?: () => void;
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function extractPassIdentifier(rawText: string): { kind: 'uuid' | 'payload'; value: string } | null {
   const trimmed = rawText.trim();
   if (!trimmed) return null;

   try {
      const url = new URL(trimmed);
      const rParam = url.searchParams.get('r');
      if (rParam && UUID_RE.test(rParam)) {
         const match = rParam.match(UUID_RE);
         if (match) {
            return { kind: 'uuid', value: match[0] };
         }
      }
   } catch {
      // Not a URL, fall through
   }

   if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return { kind: 'uuid', value: trimmed };
   }

   return { kind: 'payload', value: trimmed };
}

export function useLogic(props: GatePageProps) {
   const { accountId, fullName, onSignOut, onBack } = props;

   const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
   const [games, setGames] = useState<{ id: string; name: string }[]>([]);
   const [eventId, setEventId] = useState('');
   const [gameId, setGameId] = useState('');

   const [query, setQuery] = useState('');
   const [results, setResults] = useState<GateAttendant[]>([]);
   const [searching, setSearching] = useState(false);

   const [pending, setPending] = useState<{ attendant: GateAttendant; method: Method } | null>(null);
   const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
   const [confirming, setConfirming] = useState(false);

   useEffect(() => {
      supabase
         .from('events')
         .select('id, name')
         .order('created_at', { ascending: false })
         .then(({ data }) => {
            setEvents(data ?? []);
         });
   }, []);

   async function handleEventChange(e: React.ChangeEvent<HTMLSelectElement>) {
      const nextEventId = e.target.value;
      setEventId(nextEventId);
      setGameId('');
      setGames([]);
      setResults([]);
      setQuery('');
      setPending(null);
      setNotice(null);

      if (!nextEventId) return;

      const { data } = await supabase
         .from('games')
         .select('id, name')
         .eq('event_id', nextEventId)
         .eq('game_type', 'LUCKY_DRAW')
         .order('created_at', { ascending: false });

      const gameList = data ?? [];
      setGames(gameList);
      if (gameList.length === 1) {
         setGameId(gameList[0].id);
      }
   }

   function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setGameId(e.target.value);
      setResults([]);
      setQuery('');
      setPending(null);
      setNotice(null);
   }

   const lookupAttendant = useCallback(
      async (rawText: string): Promise<GateAttendant | null> => {
         const parsed = extractPassIdentifier(rawText);
         if (!parsed) return null;

         let queryBuilder = supabase
            .from('lucky_draw_attendants')
            .select('*, games!inner(id, name, event_id, events!inner(id, name))');

         if (parsed.kind === 'uuid') {
            queryBuilder = queryBuilder.eq('id', parsed.value);
         } else {
            queryBuilder = queryBuilder.or(
               `qr_code_payload.eq.${parsed.value},ticket_code.eq.${parsed.value}`,
            );
            if (gameId) {
               queryBuilder = queryBuilder.eq('game_id', gameId);
            }
         }

         const { data, error } = await queryBuilder.limit(1).maybeSingle();
         if (error) {
            throw new Error(error.message);
         }
         if (!data) return null;

         return {
            id: data.id,
            game_id: data.game_id,
            game_name: data.games.name,
            event_id: data.games.event_id,
            event_name: data.games.events.name,
            full_name: data.full_name,
            email: data.email ?? '',
            phone: data.phone,
            company_name: data.company_name,
            department: data.department,
            ticket_code: data.ticket_code,
            qr_code_payload: data.qr_code_payload,
            is_checked_in: Boolean(data.is_checked_in),
            checked_in_at: data.checked_in_at,
            check_in_method: data.check_in_method,
         };
      },
      [gameId],
   );

   const handleScan = useCallback(
      async (text: string) => {
         try {
            const attendant = await lookupAttendant(text);
            if (!attendant) {
               setNotice({ kind: 'error', text: 'Pass not found. Verify the QR code or use manual search.' });
               return;
            }
            setNotice(null);
            setPending({ attendant, method: 'qr' });
         } catch (err: unknown) {
            setNotice({
               kind: 'error',
               text: err instanceof Error ? err.message : 'Failed to verify QR code.',
            });
         }
      },
      [lookupAttendant],
   );

   useEffect(() => {
      const trimmed = query.trim();
      if (!gameId || !trimmed) {
         return;
      }

      let active = true;
      const timer = setTimeout(async () => {
         setSearching(true);
         const { data, error } = await supabase
            .from('lucky_draw_attendants')
            .select('*, games!inner(id, name, event_id, events!inner(id, name))')
            .eq('game_id', gameId)
            .or(
               `full_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,phone.ilike.%${trimmed}%,ticket_code.ilike.%${trimmed}%,company_name.ilike.%${trimmed}%`,
            )
            .order('full_name', { ascending: true })
            .limit(30);

         if (!active) return;

         if (error) {
            setNotice({ kind: 'error', text: error.message });
         } else {
            const mapped: GateAttendant[] = (data ?? []).map((row) => ({
               id: row.id,
               game_id: row.game_id,
               game_name: row.games.name,
               event_id: row.games.event_id,
               event_name: row.games.events.name,
               full_name: row.full_name,
               email: row.email ?? '',
               phone: row.phone,
               company_name: row.company_name,
               department: row.department,
               ticket_code: row.ticket_code,
               qr_code_payload: row.qr_code_payload,
               is_checked_in: Boolean(row.is_checked_in),
               checked_in_at: row.checked_in_at,
               check_in_method: row.check_in_method,
            }));
            setResults(mapped);
         }
         setSearching(false);
      }, 300);

      return () => {
         active = false;
         clearTimeout(timer);
      };
   }, [query, gameId]);

   function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
      const val = e.target.value;
      setQuery(val);
      if (!val.trim()) {
         setResults([]);
      }
   }

   const wrongGame = Boolean(pending && pending.attendant.game_id !== gameId);
   const alreadyIn = Boolean(pending?.attendant.is_checked_in);

   async function confirmCheckin() {
      if (!pending) return;
      setConfirming(true);

      const dbMethod: CheckInMethod = pending.method === 'qr' ? 'QR_SCAN' : 'MANUAL_SEARCH';
      const nowIso = new Date().toISOString();

      const { data, error } = await supabase
         .from('lucky_draw_attendants')
         .update({
            is_checked_in: true,
            checked_in_at: nowIso,
            checked_in_by: accountId,
            check_in_method: dbMethod,
         })
         .eq('id', pending.attendant.id)
         .eq('is_checked_in', false)
         .select('id');

      setConfirming(false);

      if (error) {
         setNotice({ kind: 'error', text: error.message });
         return;
      }

      if (!data || data.length === 0) {
         setNotice({ kind: 'error', text: `${pending.attendant.full_name} was already checked in.` });
         setPending(null);
         return;
      }

      await supabase.from('logs').insert({
         account_id: accountId,
         event_id: pending.attendant.event_id,
         game_id: pending.attendant.game_id,
         action_type: pending.method === 'qr' ? 'CHECKIN_QR_SCAN' : 'CHECKIN_MANUAL_SEARCH',
         target_entity: 'lucky_draw_attendants',
         target_id: pending.attendant.id,
         metadata: {
            ticket_code: pending.attendant.ticket_code,
            full_name: pending.attendant.full_name,
         },
      });

      const checkedInId = pending.attendant.id;
      setNotice({ kind: 'ok', text: `Checked in ${pending.attendant.full_name} (${pending.attendant.ticket_code}).` });
      setPending(null);

      setResults((prev) =>
         prev.map((item) =>
            item.id === checkedInId
               ? {
                    ...item,
                    is_checked_in: true,
                    checked_in_at: nowIso,
                    check_in_method: dbMethod,
                 }
               : item,
         ),
      );

      setTimeout(() => {
         setNotice((n) => (n?.kind === 'ok' ? null : n));
      }, 4000);
   }

   function handleSelectManualGuest(guest: GateAttendant) {
      setNotice(null);
      setPending({ attendant: guest, method: 'manual' });
   }

   function handleCancelPending() {
      setPending(null);
   }

   function formatCheckedInDetails(att: GateAttendant) {
      const dateStr = att.checked_in_at ? new Date(att.checked_in_at).toLocaleString() : '';
      const methodStr = att.check_in_method ? ` (${att.check_in_method})` : '';
      return `${dateStr}${methodStr}`;
   }

   return {
      param: {
         fullName,
         hasBackButton: Boolean(onBack),
         events,
         games,
         eventId,
         gameId,
         query,
         results,
         searching,
         pending,
         notice,
         confirming,
         wrongGame,
         alreadyIn,
      },
      func: {
         onSignOut,
         onBack,
         handleEventChange,
         handleGameChange,
         handleScan,
         handleQueryChange,
         confirmCheckin,
         handleSelectManualGuest,
         handleCancelPending,
         formatCheckedInDetails,
      },
   };
}

