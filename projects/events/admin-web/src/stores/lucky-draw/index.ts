import confetti from 'canvas-confetti';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { useServicesGameLuckyDrawStateRead } from '@admin-web/services/game-lucky-draw/state-read';
import { useServicesGameLuckyDrawWinnerDrawBrowser } from '@admin-web/services/game-lucky-draw/winner-draw/browser';

import { AUTO_INITIAL_DELAY_MS, AUTO_REEL_STEP_MS, DEFAULT_PLACEHOLDER_CODE } from './constants';

import type * as Types from './type';

let realtimeChannel: RealtimeChannel | null = null;
let autoStopTimeouts: number[] = [];

const clearAutoStopTimers = () => {
   autoStopTimeouts.forEach((timerId) => window.clearTimeout(timerId));
   autoStopTimeouts = [];
};

const buildPlaceholderCode = (participants: Types.Participant[]): string => {
   const sample = participants[0]?.ticketCode ?? '';

   if (!sample) {
      return DEFAULT_PLACEHOLDER_CODE;
   }

   return sample.replace(/[a-zA-Z0-9]/g, '?');
};

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

export const useStoreLuckyDraw = create<Types.Store>((set, get) => {
   const scheduleAutoReelStops = (totalReels: number) => {
      clearAutoStopTimers();

      for (let step = 1; step <= totalReels; step += 1) {
         const delay = AUTO_INITIAL_DELAY_MS + (step - 1) * AUTO_REEL_STEP_MS;
         const timerId = window.setTimeout(() => {
            const isFinal = step >= totalReels;

            set({
               stoppedReels: step,
               isSpinning: !isFinal,
            });

            if (isFinal) {
               triggerFireworks();
            }
         }, delay);

         autoStopTimeouts.push(timerId);
      }
   };

   const executeDraw = async (revokeWinnerRecordId?: string) => {
      const state = get();
      const currentPrize = state.prizes[state.currentPrizeIndex] ?? null;

      if (!state.gameId || !currentPrize || state.isDrawingRequest) {
         return;
      }

      if (state.isSpinning && state.drawMode !== 'instant') {
         return;
      }

      clearAutoStopTimers();
      set({
         isDrawingRequest: true,
         notice: null,
      });

      const serviceDraw = await useServicesGameLuckyDrawWinnerDrawBrowser({
         gameId: state.gameId,
         prizeId: currentPrize.id,
         revokeWinnerRecordId,
         excludeAttendantIds: state.forfeitedAttendantIds,
      });

      if (serviceDraw.error) {
         set({
            isDrawingRequest: false,
            isSpinning: false,
            notice: {
               kind: 'error',
               text: serviceDraw.message,
            },
         });
         return;
      }

      const { winner, attendant, prize, revokedWinnerRecordId, revokedAttendantId } = serviceDraw.data;
      const ticketCode = attendant.ticket_code;

      const updatedPrizes = get().prizes.map((item) =>
         item.id === prize.id
            ? {
                 ...item,
                 remainingQuantity: prize.remaining_quantity,
                 totalQuantity: prize.total_quantity,
              }
            : item,
      );

      const nextForfeitedIds = revokedAttendantId
         ? [...new Set([...get().forfeitedAttendantIds, revokedAttendantId])]
         : get().forfeitedAttendantIds;

      const existingParticipants = get().participants;
      const hasParticipant = existingParticipants.some((item) => item.id === attendant.id);

      const updatedParticipants = (
         hasParticipant
            ? existingParticipants
            : [
                 ...existingParticipants,
                 {
                    id: attendant.id,
                    ticketCode: attendant.ticket_code,
                    name: attendant.full_name,
                    companyName: attendant.company_name,
                    department: attendant.department,
                    hasWon: true,
                    isAbsentForfeited: false,
                 },
              ]
      ).map((item) => {
         if (item.id === attendant.id) {
            return { ...item, hasWon: true };
         }

         if (revokedAttendantId && item.id === revokedAttendantId) {
            return { ...item, hasWon: false, isAbsentForfeited: true };
         }

         return item;
      });

      const filteredWinners = revokedWinnerRecordId
         ? get().winners.filter((item) => item.id !== revokedWinnerRecordId)
         : get().winners;

      const nextWinnerEntry: Types.Winner_Entry = {
         id: winner.id,
         prizeId: winner.prize_id,
         attendantId: attendant.id,
         ticketCode: attendant.ticket_code,
         name: attendant.full_name,
         companyName: attendant.company_name,
         department: attendant.department,
         wonAt: winner.won_at,
      };

      const isInstant = get().drawMode === 'instant';

      set({
         prizes: updatedPrizes,
         participants: updatedParticipants,
         winners: [...filteredWinners, nextWinnerEntry],
         forfeitedAttendantIds: nextForfeitedIds,
         winnerId: ticketCode,
         activeWinnerId: ticketCode,
         activeWinnerRecordId: winner.id,
         isDrawingRequest: false,
         isSpinning: !isInstant,
         stoppedReels: isInstant ? ticketCode.length : 0,
      });

      if (isInstant) {
         triggerFireworks();
      } else if (get().drawMode === 'auto') {
         scheduleAutoReelStops(ticketCode.length);
      }
   };

   return {
      gameId: '',
      prizes: [],
      participants: [],
      winners: [],
      forfeitedAttendantIds: [],
      currentPrizeIndex: 0,
      winnerId: DEFAULT_PLACEHOLDER_CODE,
      activeWinnerId: null,
      activeWinnerRecordId: null,
      isSpinning: false,
      isDrawingRequest: false,
      isLoadingGame: false,
      isRealtimeConnected: false,
      stoppedReels: 0,
      drawMode: 'auto',
      showWinners: false,
      hideHud: false,
      notice: null,

      cleanupRealtime: () => {
         clearAutoStopTimers();

         if (realtimeChannel) {
            void supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
         }

         set({ isRealtimeConnected: false });
      },

      loadGameData: async (gameId) => {
         clearAutoStopTimers();

         if (!gameId) {
            get().cleanupRealtime();
            set({
               gameId: '',
               prizes: [],
               participants: [],
               winners: [],
               forfeitedAttendantIds: [],
               currentPrizeIndex: 0,
               winnerId: DEFAULT_PLACEHOLDER_CODE,
               activeWinnerId: null,
               activeWinnerRecordId: null,
               isSpinning: false,
               isDrawingRequest: false,
               isLoadingGame: false,
               stoppedReels: 0,
               notice: null,
            });
            return;
         }

         const isSameGame = get().gameId === gameId;

         set({
            gameId,
            isLoadingGame: true,
            notice: null,
         });

         const serviceState = await useServicesGameLuckyDrawStateRead({ gameId });

         if (serviceState.error) {
            set({
               isLoadingGame: false,
               notice: {
                  kind: 'error',
                  text: serviceState.message,
               },
            });
            return;
         }

         const { prizes, participants, winners } = serviceState.data;
         const placeholderCode = buildPlaceholderCode(participants);
         const preservedPrizeIndex =
            isSameGame && get().currentPrizeIndex < prizes.length ? get().currentPrizeIndex : 0;

         set({
            gameId,
            prizes,
            participants,
            winners,
            forfeitedAttendantIds: participants.filter((p) => p.isAbsentForfeited).map((p) => p.id),
            currentPrizeIndex: preservedPrizeIndex,
            winnerId: placeholderCode,
            activeWinnerId: null,
            activeWinnerRecordId: null,
            isSpinning: false,
            isDrawingRequest: false,
            isLoadingGame: false,
            stoppedReels: 0,
         });

         if (realtimeChannel) {
            void supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
         }

         realtimeChannel = supabase
            .channel(`lucky-draw-live:${gameId}`)
            .on(
               'postgres_changes',
               {
                  event: '*',
                  schema: 'public',
                  table: 'lucky_draw_attendants',
                  filter: `game_id=eq.${gameId}`,
               },
               async () => {
                  const latestState = await useServicesGameLuckyDrawStateRead({ gameId });
                  if (!latestState.error && get().gameId === gameId) {
                     set({
                        participants: latestState.data.participants,
                        prizes: latestState.data.prizes,
                        winners: latestState.data.winners,
                     });
                  }
               },
            )
            .subscribe((status) => {
               set({ isRealtimeConnected: status === 'SUBSCRIBED' });
            });
      },

      setCurrentPrize: (index) => {
         clearAutoStopTimers();
         const placeholder = buildPlaceholderCode(get().participants);

         set({
            currentPrizeIndex: index,
            winnerId: placeholder,
            activeWinnerId: null,
            activeWinnerRecordId: null,
            isSpinning: false,
            stoppedReels: 0,
            notice: null,
         });
      },

      setDrawMode: (drawMode) => {
         set({ drawMode });
      },

      setShowWinners: (value) => {
         const next = typeof value === 'function' ? value(get().showWinners) : value;
         set({ showWinners: next });
      },

      setHideHud: (value) => {
         const next = typeof value === 'function' ? value(get().hideHud) : value;
         set({ hideHud: next });
      },

      setNotice: (notice) => {
         set({ notice });
      },

      clearNotice: () => {
         set({ notice: null });
      },

      startDraw: async () => {
         await executeDraw();
      },

      handleManualStop: () => {
         const state = get();

         if (!state.isSpinning) {
            return;
         }

         if (state.drawMode === 'auto') {
            clearAutoStopTimers();
         }

         const totalReels = state.winnerId.length;
         const nextStopped = Math.min(totalReels, state.stoppedReels + 1);
         const isFinal = nextStopped >= totalReels;

         set({
            stoppedReels: nextStopped,
            isSpinning: !isFinal,
         });

         if (isFinal) {
            triggerFireworks();
         }
      },

      redrawAbsentWinner: async () => {
         const { activeWinnerRecordId } = get();
         if (!activeWinnerRecordId) {
            return;
         }

         await executeDraw(activeWinnerRecordId);
      },
   };
});

