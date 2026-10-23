import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { supabase } from '@renderer/lib/supabase';

import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '@renderer/lib/database.types';

type AttendantRow = Database['public']['Tables']['lucky_draw_attendants']['Row'];

export type EventOption = {
   id: string;
   name: string;
   status: Database['public']['Enums']['event_status'] | null;
};

export type GameOption = {
   id: string;
   event_id: string;
   name: string;
   status: Database['public']['Enums']['game_status'] | null;
};

export type Participant = {
   id: string; // ticket_code (displayed on the slot reels)
   attendantId: string; // lucky_draw_attendants.id
   name: string;
   email: string;
   phone: string;
   companyName: string;
   department: string;
   hasWon: boolean;
};

export type Prize = {
   id: string;
   name: string;
   description: string;
   imageUrl: string;
   tierOrder: number;
   totalQuantity: number;
   remainingQuantity: number;
};

export type WinnerEntry = {
   id: string;
   prizeId: string;
   attendantId: string;
   ticketCode: string;
   name: string;
   companyName: string;
   wonAt: string | null;
};

export type DrawNotice = {
   kind: 'info' | 'warning' | 'error';
   text: string;
};

export type DrawMode = 'auto' | 'manual' | 'instant';

type DrawState = {
   events: EventOption[];
   games: GameOption[];
   selectedEventId: string;
   selectedGameId: string;

   prizes: Prize[];
   participants: Participant[];
   winners: WinnerEntry[];
   currentPrizeIndex: number;

   activeWinnerId: string | null;
   activeWinnerRecordId: string | null;
   drawMode: DrawMode;

   isSpinning: boolean;
   isLoadingGame: boolean;
   isRealtimeConnected: boolean;
   winnerId: string;
   stoppedReels: number;

   showWinners: boolean;
   hideHud: boolean;
   notice: DrawNotice | null;

   loadEvents: () => Promise<void>;
   selectEvent: (eventId: string) => Promise<void>;
   loadGameData: (gameId: string) => Promise<void>;
   cleanupRealtime: () => void;

   setCurrentPrize: (index: number) => void;
   setDrawMode: (mode: DrawMode) => void;
   setShowWinners: (show: boolean | ((prev: boolean) => boolean)) => void;
   setHideHud: (hide: boolean | ((prev: boolean) => boolean)) => void;
   notify: (kind: DrawNotice['kind'], text: string) => void;
   clearNotice: () => void;

   startDraw: (accountId: string) => Promise<void>;
   handleManualStop: () => void;
   redrawAbsentWinner: (accountId: string) => Promise<void>;
};

const placeholderFor = (participants: Participant[]) =>
   participants.length > 0 ? '?'.repeat(participants[0].id.length) : '0000';

let noticeTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeChannel: RealtimeChannel | null = null;

function triggerFireworks(): void {
   const duration = 3500;
   const animationEnd = Date.now() + duration;
   const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

   const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
         clearInterval(interval);
         return;
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
         ...defaults,
         particleCount,
         origin: { x: 0.2, y: 0.5 },
         colors: ['#fbbf24', '#f59e0b', '#ffffff', '#3b82f6'],
      });
      confetti({
         ...defaults,
         particleCount,
         origin: { x: 0.8, y: 0.5 },
         colors: ['#fbbf24', '#ef4444', '#ffffff', '#10b981'],
      });
   }, 250);
}

async function fetchCheckedInParticipants(gameId: string): Promise<Participant[]> {
   const BATCH_SIZE = 1000;
   const allParticipants: Participant[] = [];
   let offset = 0;

   while (true) {
      const { data, error } = await supabase
         .from('lucky_draw_attendants')
         .select('id, ticket_code, full_name, email, phone, company_name, department, has_won')
         .eq('game_id', gameId)
         .eq('is_checked_in', true)
         .order('created_at', { ascending: true })
         .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
         throw new Error(error.message);
      }

      const rows = data ?? [];
      for (const row of rows) {
         allParticipants.push({
            id: row.ticket_code,
            attendantId: row.id,
            name: row.full_name,
            email: row.email ?? '',
            phone: row.phone ?? '',
            companyName: row.company_name ?? '',
            department: row.department ?? '',
            hasWon: Boolean(row.has_won),
         });
      }

      if (rows.length < BATCH_SIZE) {
         break;
      }

      offset += BATCH_SIZE;
   }

   return allParticipants;
}

export const useDrawStore = create<DrawState>((set, get) => ({
   events: [],
   games: [],
   selectedEventId: '',
   selectedGameId: '',

   prizes: [],
   participants: [],
   winners: [],
   currentPrizeIndex: 0,

   activeWinnerId: null,
   activeWinnerRecordId: null,
   drawMode: 'auto',

   isSpinning: false,
   isLoadingGame: false,
   isRealtimeConnected: false,
   winnerId: '0000',
   stoppedReels: 0,

   showWinners: false,
   hideHud: false,
   notice: null,

   setShowWinners: (show) =>
      set((state) => ({
         showWinners: typeof show === 'function' ? show(state.showWinners) : show,
      })),

   setHideHud: (hide) =>
      set((state) => ({
         hideHud: typeof hide === 'function' ? hide(state.hideHud) : hide,
      })),

   notify: (kind, text) => {
      if (noticeTimer) clearTimeout(noticeTimer);
      set({ notice: { kind, text } });
      noticeTimer = setTimeout(() => {
         set({ notice: null });
      }, 4500);
   },

   clearNotice: () => {
      if (noticeTimer) clearTimeout(noticeTimer);
      set({ notice: null });
   },

   cleanupRealtime: () => {
      if (realtimeChannel) {
         supabase.removeChannel(realtimeChannel);
         realtimeChannel = null;
      }
      set({ isRealtimeConnected: false });
   },

   loadEvents: async () => {
      const { data, error } = await supabase
         .from('events')
         .select('id, name, status')
         .order('created_at', { ascending: false });

      if (error) {
         get().notify('error', `Failed to load events: ${error.message}`);
         return;
      }

      set({ events: data ?? [] });
   },

   selectEvent: async (eventId) => {
      get().cleanupRealtime();
      set({
         selectedEventId: eventId,
         selectedGameId: '',
         games: [],
         prizes: [],
         participants: [],
         winners: [],
         currentPrizeIndex: 0,
         activeWinnerId: null,
         activeWinnerRecordId: null,
         isSpinning: false,
         stoppedReels: 0,
         winnerId: '0000',
         notice: null,
      });

      if (!eventId) return;

      const { data, error } = await supabase
         .from('games')
         .select('id, event_id, name, status')
         .eq('event_id', eventId)
         .eq('game_type', 'LUCKY_DRAW')
         .order('created_at', { ascending: false });

      if (error) {
         get().notify('error', `Failed to load games: ${error.message}`);
         return;
      }

      set({ games: data ?? [] });
   },

   loadGameData: async (gameId) => {
      get().cleanupRealtime();

      set({
         selectedGameId: gameId,
         prizes: [],
         participants: [],
         winners: [],
         currentPrizeIndex: 0,
         activeWinnerId: null,
         activeWinnerRecordId: null,
         isSpinning: false,
         isLoadingGame: Boolean(gameId),
         stoppedReels: 0,
         winnerId: '0000',
         notice: null,
      });

      if (!gameId) return;

      try {
         const [prizesRes, participants, winnersRes] = await Promise.all([
            supabase
               .from('lucky_draw_prizes')
               .select('*')
               .eq('game_id', gameId)
               .order('tier_order', { ascending: true }),
            fetchCheckedInParticipants(gameId),
            supabase
               .from('lucky_draw_winners')
               .select('id, prize_id, attendant_id, won_at, lucky_draw_attendants(ticket_code, full_name, company_name)')
               .eq('game_id', gameId)
               .order('won_at', { ascending: true }),
         ]);

         if (prizesRes.error) {
            throw new Error(prizesRes.error.message);
         }
         if (winnersRes.error) {
            throw new Error(winnersRes.error.message);
         }

         if (get().selectedGameId !== gameId) return;

         const prizes: Prize[] = (prizesRes.data ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description ?? '',
            imageUrl: p.image_url || 'https://placehold.co/300x400/0f172a/fbbf24?text=Prize',
            tierOrder: p.tier_order,
            totalQuantity: p.total_quantity,
            remainingQuantity: p.remaining_quantity,
         }));

         const winners: WinnerEntry[] = (winnersRes.data ?? []).map((w) => ({
            id: w.id,
            prizeId: w.prize_id,
            attendantId: w.attendant_id,
            ticketCode: w.lucky_draw_attendants?.ticket_code ?? '',
            name: w.lucky_draw_attendants?.full_name ?? '',
            companyName: w.lucky_draw_attendants?.company_name ?? '',
            wonAt: w.won_at,
         }));

         set({
            prizes,
            participants,
            winners,
            winnerId: placeholderFor(participants),
            isLoadingGame: false,
         });

         realtimeChannel = supabase
            .channel(`lucky-draw-stage-${gameId}`)
            .on<AttendantRow>(
               'postgres_changes',
               {
                  event: '*',
                  schema: 'public',
                  table: 'lucky_draw_attendants',
                  filter: `game_id=eq.${gameId}`,
               },
               (payload) => {
                  const currentState = get();
                  if (currentState.selectedGameId !== gameId) return;

                  if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                     const updated = payload.new;
                     if (updated.is_checked_in) {
                        const mapped: Participant = {
                           id: updated.ticket_code,
                           attendantId: updated.id,
                           name: updated.full_name,
                           email: updated.email ?? '',
                           phone: updated.phone ?? '',
                           companyName: updated.company_name ?? '',
                           department: updated.department ?? '',
                           hasWon: Boolean(updated.has_won),
                        };

                        set((state) => {
                           const exists = state.participants.some((p) => p.attendantId === updated.id);
                           const nextParticipants = exists
                              ? state.participants.map((p) => (p.attendantId === updated.id ? mapped : p))
                              : [...state.participants, mapped];

                           return {
                              participants: nextParticipants,
                              winnerId:
                                 !state.isSpinning && !state.activeWinnerId
                                    ? placeholderFor(nextParticipants)
                                    : state.winnerId,
                           };
                        });
                     } else {
                        set((state) => ({
                           participants: state.participants.filter((p) => p.attendantId !== updated.id),
                        }));
                     }
                  } else if (payload.eventType === 'DELETE') {
                     const removedId = payload.old.id;
                     if (removedId) {
                        set((state) => ({
                           participants: state.participants.filter((p) => p.attendantId !== removedId),
                        }));
                     }
                  }
               },
            )
            .subscribe((status) => {
               set({ isRealtimeConnected: status === 'SUBSCRIBED' });
            });
      } catch (err: unknown) {
         set({ isLoadingGame: false });
         get().notify('error', err instanceof Error ? err.message : 'Failed to load game data.');
      }
   },

   setCurrentPrize: (index) => {
      const { isSpinning, participants } = get();
      if (isSpinning) return;
      set({
         currentPrizeIndex: index,
         activeWinnerId: null,
         activeWinnerRecordId: null,
         stoppedReels: 0,
         winnerId: placeholderFor(participants),
         notice: null,
      });
   },

   setDrawMode: (mode) => set({ drawMode: mode }),

   startDraw: async (accountId) => {
      const state = get();
      if (state.isSpinning) return;

      const prize = state.prizes[state.currentPrizeIndex];
      if (!prize) {
         state.notify('warning', 'Please select a prize first.');
         return;
      }

      if (prize.remainingQuantity <= 0) {
         state.notify('warning', `All "${prize.name}" prizes have already been drawn.`);
         return;
      }

      const available = state.participants.filter((p) => !p.hasWon);
      if (available.length === 0) {
         state.notify('warning', 'No eligible checked-in guests left to draw.');
         return;
      }

      const winner = available[Math.floor(Math.random() * available.length)];

      set({ isSpinning: true, notice: null });

      const { data: updatedAttendant, error: attError } = await supabase
         .from('lucky_draw_attendants')
         .update({ has_won: true })
         .eq('id', winner.attendantId)
         .eq('has_won', false)
         .select('id');

      if (attError || !updatedAttendant?.length) {
         set({ isSpinning: false });
         get().notify('error', 'Could not lock winner record. Please try again.');
         return;
      }

      const { data: winnerRow, error: winError } = await supabase
         .from('lucky_draw_winners')
         .insert({
            game_id: state.selectedGameId,
            prize_id: prize.id,
            attendant_id: winner.attendantId,
            drawn_by: accountId,
         })
         .select('id, won_at')
         .single();

      if (winError || !winnerRow) {
         await supabase.from('lucky_draw_attendants').update({ has_won: false }).eq('id', winner.attendantId);
         set({ isSpinning: false });
         get().notify('error', `Could not save winner: ${winError?.message ?? 'Unknown error'}`);
         return;
      }

      const nextRemaining = Math.max(0, prize.remainingQuantity - 1);
      await supabase
         .from('lucky_draw_prizes')
         .update({ remaining_quantity: nextRemaining })
         .eq('id', prize.id);

      if (accountId) {
         await supabase.from('logs').insert({
            account_id: accountId,
            event_id: state.selectedEventId || null,
            game_id: state.selectedGameId,
            action_type: 'PRIZE_DRAWN',
            target_entity: 'lucky_draw_winners',
            target_id: winnerRow.id,
            metadata: {
               prize_id: prize.id,
               prize_name: prize.name,
               attendant_id: winner.attendantId,
               ticket_code: winner.id,
               full_name: winner.name,
            },
         });
      }

      const winnerIdStr = winner.id;
      const newWinnerEntry: WinnerEntry = {
         id: winnerRow.id,
         prizeId: prize.id,
         attendantId: winner.attendantId,
         ticketCode: winner.id,
         name: winner.name,
         companyName: winner.companyName,
         wonAt: winnerRow.won_at,
      };

      set((prev) => ({
         winnerId: winnerIdStr,
         stoppedReels: 0,
         activeWinnerId: winner.id,
         activeWinnerRecordId: winnerRow.id,
         participants: prev.participants.map((p) =>
            p.attendantId === winner.attendantId ? { ...p, hasWon: true } : p,
         ),
         prizes: prev.prizes.map((p) =>
            p.id === prize.id ? { ...p, remainingQuantity: nextRemaining } : p,
         ),
         winners: [...prev.winners, newWinnerEntry],
      }));

      if (state.drawMode === 'instant') {
         set({ isSpinning: false, stoppedReels: winnerIdStr.length });
         triggerFireworks();
      } else if (state.drawMode === 'auto') {
         winnerIdStr.split('').forEach((_, index) => {
            setTimeout(
               () => {
                  const currentStopped = get().stoppedReels + 1;
                  set({ stoppedReels: currentStopped });
                  if (currentStopped === winnerIdStr.length) {
                     set({ isSpinning: false });
                     triggerFireworks();
                  }
               },
               1000 + index * 700,
            );
         });
      }
   },

   handleManualStop: () => {
      const state = get();
      if (state.drawMode !== 'manual' || !state.isSpinning) return;

      const next = state.stoppedReels + 1;
      set({ stoppedReels: next });

      if (next === state.winnerId.length) {
         set({ isSpinning: false });
         triggerFireworks();
      }
   },

   redrawAbsentWinner: async (accountId) => {
      const state = get();
      if (state.isSpinning || !state.activeWinnerRecordId || !state.activeWinnerId) return;

      const prize = state.prizes[state.currentPrizeIndex];
      if (!prize) return;

      const recordIdToRemove = state.activeWinnerRecordId;
      const absentTicket = state.activeWinnerId;

      const { error: deleteErr } = await supabase
         .from('lucky_draw_winners')
         .delete()
         .eq('id', recordIdToRemove);

      if (deleteErr) {
         state.notify('error', `Failed to void absent winner: ${deleteErr.message}`);
         return;
      }

      const restoredRemaining = Math.min(prize.totalQuantity, prize.remainingQuantity + 1);
      await supabase
         .from('lucky_draw_prizes')
         .update({ remaining_quantity: restoredRemaining })
         .eq('id', prize.id);

      set((prev) => ({
         activeWinnerId: null,
         activeWinnerRecordId: null,
         stoppedReels: 0,
         winnerId: placeholderFor(prev.participants),
         winners: prev.winners.filter((w) => w.id !== recordIdToRemove),
         prizes: prev.prizes.map((p) =>
            p.id === prize.id ? { ...p, remainingQuantity: restoredRemaining } : p,
         ),
      }));

      get().notify('info', `Marked ticket ${absentTicket} as absent. Drawing replacement...`);
      await get().startDraw(accountId);
   },
}));

