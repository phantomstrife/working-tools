// src/stores/lucky-draw.ts
import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { supabase } from '@renderer/lib/supabase';

export interface Participant {
   id: string; // Ticket code (kept as `id` so existing UI that reads it keeps working)
   registrationId: string; // event_registrations.id, used for DB writes
   name: string;
   email: string;
   prizeId: string | null; // null = not drawn yet
}

export interface Prize {
   id: string;
   name: string;
   imageUrl: string;
   quantity: number;
}

export interface DrawNotice {
   kind: 'info' | 'warning' | 'error';
   text: string;
}

interface DrawState {
   selectedEventId: string | null;
   prizes: Prize[];
   participants: Participant[]; // all scanned-in registrations for the event
   currentPrizeIndex: number;
   activeWinnerId: string | null;
   drawMode: 'auto' | 'manual' | 'instant';

   isSpinning: boolean;
   winnerId: string;
   stoppedReels: number;

   showWinners: boolean;
   notice: DrawNotice | null;

   fetchEventData: (eventId: string) => Promise<void>;
   setCurrentPrize: (index: number) => void;
   setWinner: (winnerId: string | null) => void;
   setDrawMode: (mode: 'auto' | 'manual' | 'instant') => void;
   markAsDrawn: (participantId: string, prizeId: string) => Promise<boolean>;

   setShowWinners: (show: boolean | ((prev: boolean) => boolean)) => void;
   notify: (kind: DrawNotice['kind'], text: string) => void;
   clearNotice: () => void;

   setPlaceholderId: (length: number) => void;
   startDraw: () => Promise<void>;
   handleManualStop: () => void;
}

const placeholderFor = (participants: Participant[]) =>
   participants.length ? '?'.repeat(participants[0].id.length) : '000';

let noticeTimer: ReturnType<typeof setTimeout> | null = null;

const triggerFireworks = () => {
   const duration = 3.5 * 1000;
   const animationEnd = Date.now() + duration;
   const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

   const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
         return clearInterval(interval);
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
};

export const useDrawStore = create<DrawState>((set, get) => ({
   selectedEventId: null,
   prizes: [],
   participants: [],
   currentPrizeIndex: 0,
   activeWinnerId: null,
   drawMode: 'auto',

   isSpinning: false,
   winnerId: '000',
   stoppedReels: 0,

   showWinners: false,
   notice: null,

   setShowWinners: (show) =>
      set((state) => ({
         showWinners: typeof show === 'function' ? show(state.showWinners) : show,
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

   fetchEventData: async (eventId) => {
      set({
         selectedEventId: eventId,
         prizes: [],
         participants: [],
         currentPrizeIndex: 0,
         activeWinnerId: null,
         isSpinning: false,
         stoppedReels: 0,
         winnerId: '000',
         notice: null,
      });

      const [prizeRes, regRes] = await Promise.all([
         supabase
            .from('prize_pools')
            .select('id, name, image_url, quantity')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true }),
         supabase
            .from('event_registrations')
            .select('id, ticket_code, prize_pool_id, customers(name, email)')
            .eq('event_id', eventId)
            .eq('status', 'replied_scanned')
            .order('created_at', { ascending: true }),
      ]);

      if (prizeRes.error) {
         console.error('Error fetching prize pools:', prizeRes.error.message);
         get().notify('error', `Failed to load prizes: ${prizeRes.error.message}`);
      }
      if (regRes.error) {
         console.error('Error fetching registrations:', regRes.error.message);
         get().notify('error', `Failed to load check-ins: ${regRes.error.message}`);
      }

      // The user may have switched events while we were loading
      if (get().selectedEventId !== eventId) return;

      const prizes: Prize[] = (prizeRes.data || []).map((p) => ({
         id: p.id,
         name: p.name,
         imageUrl: p.image_url || 'https://via.placeholder.com/300x400?text=No+Image',
         quantity: p.quantity,
      }));

      const participants: Participant[] = (regRes.data || []).map((r: any) => ({
         id: r.ticket_code,
         registrationId: r.id,
         name: r.customers?.name ?? '',
         email: r.customers?.email ?? '',
         prizeId: r.prize_pool_id,
      }));

      set({ prizes, participants, winnerId: placeholderFor(participants) });
   },

   setCurrentPrize: (index) => {
      const { isSpinning, participants } = get();
      if (isSpinning) return;
      set({
         currentPrizeIndex: index,
         activeWinnerId: null,
         stoppedReels: 0,
         winnerId: placeholderFor(participants),
         notice: null,
      });
   },

   setWinner: (winnerId) => set({ activeWinnerId: winnerId }),
   setDrawMode: (mode) => set({ drawMode: mode }),
   setPlaceholderId: (length) => set({ winnerId: '?'.repeat(length) }),

   // Saves to the DB first, then updates local state. Returns true on success.
   markAsDrawn: async (participantId, prizeId) => {
      const { participants, selectedEventId } = get();
      const participant = participants.find((p) => p.id === participantId);
      if (!participant || !selectedEventId) return false;

      const { data, error } = await supabase
         .from('event_registrations')
         .update({ prize_pool_id: prizeId, drawn_at: new Date().toISOString() })
         .eq('id', participant.registrationId)
         .is('prize_pool_id', null) // refuse to overwrite an existing win
         .select('id');

      if (error || !data?.length) {
         console.error('Failed to save winner:', error?.message ?? 'already drawn');
         return false;
      }

      set((state) => ({
         participants: state.participants.map((p) => (p.id === participantId ? { ...p, prizeId } : p)),
      }));
      return true;
   },

   startDraw: async () => {
      const state = get();
      if (state.isSpinning) return;

      const prize = state.prizes[state.currentPrizeIndex];
      if (!prize) {
         state.notify('warning', 'Please select a prize first.');
         return;
      }

      const wonCount = state.participants.filter((p) => p.prizeId === prize.id).length;
      if (wonCount >= prize.quantity) {
         state.notify('warning', `All ${prize.quantity} "${prize.name}" prizes have already been drawn.`);
         return;
      }

      const available = state.participants.filter((p) => !p.prizeId);
      if (available.length === 0) {
         state.notify('warning', 'No eligible checked-in customers left to draw.');
         return;
      }

      const winner = available[Math.floor(Math.random() * available.length)];

      // Lock the UI while saving so a double click can't draw twice
      set({ isSpinning: true, notice: null });
      const saved = await get().markAsDrawn(winner.id, prize.id);
      if (!saved) {
         set({ isSpinning: false });
         get().notify('error', 'Could not save the winner. Please try again.');
         return;
      }

      const winnerIdStr = winner.id;
      set({ winnerId: winnerIdStr, stoppedReels: 0, activeWinnerId: winner.id });

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
               1000 + index * 800,
            );
         });
      }
      // 'manual' mode: handleManualStop stops the reels
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
}));
