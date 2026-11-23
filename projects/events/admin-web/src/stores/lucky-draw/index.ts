import confetti from 'canvas-confetti';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@admin-web/adapters/supabase/browser';
import { useServicesGameLuckyDrawStateRead } from '@admin-web/services/game-lucky-draw/state-read';
import { useServicesGameLuckyDrawWinnerDrawBrowser } from '@admin-web/services/game-lucky-draw/winner-draw/browser';

import {
   AUTO_INITIAL_DELAY_MS,
   AUTO_REEL_STEP_MS,
   DEFAULT_PLACEHOLDER_CODE,
   WINNER_REVEAL_DELAY_MS,
} from './constants';

import type * as Types from './type';

let realtimeChannel: RealtimeChannel | null = null;
let autoStopTimeouts: number[] = [];
let revealTimeoutId: number | null = null;
let drawSequenceId = 0;

const clearRevealTimer = () => {
   if (revealTimeoutId !== null) {
      window.clearTimeout(revealTimeoutId);
      revealTimeoutId = null;
   }
};

const clearAutoStopTimers = () => {
   autoStopTimeouts.forEach((timerId) => window.clearTimeout(timerId));
   autoStopTimeouts = [];
   clearRevealTimer();
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
   const scheduleWinnerReveal = (expectedSeq: number) => {
      clearRevealTimer();

      revealTimeoutId = window.setTimeout(() => {
         revealTimeoutId = null;

         if (expectedSeq !== drawSequenceId) {
            return;
         }

         set({
            isSpinning: false,
         });

         triggerFireworks();
      }, WINNER_REVEAL_DELAY_MS);
   };

   const scheduleAutoReelStops = (totalReels: number, initialDelayMs: number, expectedSeq: number) => {
      clearAutoStopTimers();

      for (let step = 1; step <= totalReels; step += 1) {
         const delay = initialDelayMs + (step - 1) * AUTO_REEL_STEP_MS;
         const timerId = window.setTimeout(() => {
            if (expectedSeq !== drawSequenceId) {
               return;
            }

            const isFinal = step >= totalReels;

            set({
               stoppedReels: step,
               isSpinning: true,
            });

            if (isFinal) {
               scheduleWinnerReveal(expectedSeq);
            }
         }, delay);

         autoStopTimeouts.push(timerId);
      }
   };

   const executeDraw = async (revokeWinnerRecordId?: string) => {
      const state = get();
      const currentPrize = state.prizes[state.currentPrizeIndex] ?? null;

      if (!state.gameId || !currentPrize || state.isDrawingRequest || state.isLoadingGame || state.isSpinning) {
         return;
      }

      if (!revokeWinnerRecordId && currentPrize.remainingQuantity <= 0) {
         return;
      }

      const revokedAttendantFromRecord = revokeWinnerRecordId
         ? (state.winners.find((item) => item.id === revokeWinnerRecordId)?.attendantId ?? null)
         : null;
      const excludedSet = new Set<string>([
         ...state.forfeitedAttendantIds,
         ...(revokedAttendantFromRecord ? [revokedAttendantFromRecord] : []),
      ]);
      const hasEligibleParticipant = state.participants.some(
         (participant) =>
            participant.isDrawEligible &&
            !participant.hasWon &&
            !participant.isAbsentForfeited &&
            !excludedSet.has(participant.id),
      );

      if (!hasEligibleParticipant) {
         set({
            notice: {
               kind: 'error',
               text: 'services.game_lucky_draw.draw.no_eligible_attendants',
            },
         });
         return;
      }

      // Immediately start spinning on frame 1 before awaiting the draw API.
      clearAutoStopTimers();
      drawSequenceId += 1;
      const currentSeq = drawSequenceId;
      const spinStartedAt = Date.now();
      const spinningPlaceholder = buildPlaceholderCode(state.participants);

      set({
         winnerId: spinningPlaceholder,
         activeWinnerId: null,
         activeWinnerRecordId: null,
         stoppedReels: 0,
         queuedManualStops: 0,
         isSpinning: true,
         isDrawingRequest: true,
         notice: null,
      });

      const serviceDraw = await useServicesGameLuckyDrawWinnerDrawBrowser({
         gameId: state.gameId,
         prizeId: currentPrize.id,
         revokeWinnerRecordId,
         excludeAttendantIds: state.forfeitedAttendantIds,
      });

      // Discard stale responses if the operator switched prize/game or left the page mid-spin.
      if (currentSeq !== drawSequenceId) {
         return;
      }

      if (serviceDraw.error) {
         clearAutoStopTimers();
         set({
            winnerId: buildPlaceholderCode(get().participants),
            activeWinnerId: null,
            activeWinnerRecordId: null,
            stoppedReels: 0,
            queuedManualStops: 0,
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

      const salutation = attendant.salutation?.trim() || null;
      const phone = attendant.phone?.trim() || null;
      const representativeSalutation = attendant.representative_salutation?.trim() || null;
      const representative = attendant.representative?.trim() || null;
      const representativePhone = attendant.representative_phone?.trim() || null;

      const updatedParticipants = (
         hasParticipant
            ? existingParticipants
            : [
                 ...existingParticipants,
                 {
                    id: attendant.id,
                    ticketCode: attendant.ticket_code,
                    salutation,
                    name: attendant.full_name,
                    phone,
                    representativeSalutation,
                    representative,
                    representativePhone,
                    companyName: attendant.company_name,
                    department: attendant.department,
                    hasWon: true,
                    isAbsentForfeited: false,
                    isDrawEligible: Boolean(attendant.is_draw_eligible),
                 },
              ]
      ).map((item) => {
         if (item.id === attendant.id) {
            return {
               ...item,
               salutation,
               phone,
               representativeSalutation,
               representative,
               representativePhone,
               hasWon: true,
               isDrawEligible: Boolean(attendant.is_draw_eligible),
            };
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
         salutation,
         name: attendant.full_name,
         phone,
         representativeSalutation,
         representative,
         representativePhone,
         companyName: attendant.company_name,
         department: attendant.department,
         wonAt: winner.won_at,
      };

      const latestState = get();
      const mode = latestState.drawMode;
      const queuedStops = latestState.queuedManualStops;

      if (mode === 'instant') {
         set({
            prizes: updatedPrizes,
            participants: updatedParticipants,
            winners: [...filteredWinners, nextWinnerEntry],
            forfeitedAttendantIds: nextForfeitedIds,
            winnerId: ticketCode,
            activeWinnerId: ticketCode,
            activeWinnerRecordId: winner.id,
            isDrawingRequest: false,
            isSpinning: true,
            stoppedReels: ticketCode.length,
            queuedManualStops: 0,
         });
         scheduleWinnerReveal(currentSeq);
         return;
      }

      if (mode === 'manual' || queuedStops > 0) {
         const initialStopped = Math.min(ticketCode.length, queuedStops);
         const isFinal = initialStopped >= ticketCode.length;

         set({
            prizes: updatedPrizes,
            participants: updatedParticipants,
            winners: [...filteredWinners, nextWinnerEntry],
            forfeitedAttendantIds: nextForfeitedIds,
            winnerId: ticketCode,
            activeWinnerId: ticketCode,
            activeWinnerRecordId: winner.id,
            isDrawingRequest: false,
            isSpinning: true,
            stoppedReels: initialStopped,
            queuedManualStops: 0,
         });

         if (isFinal) {
            scheduleWinnerReveal(currentSeq);
         }
         return;
      }

      const elapsedMs = Date.now() - spinStartedAt;
      const remainingInitialDelayMs = Math.max(0, AUTO_INITIAL_DELAY_MS - elapsedMs);

      set({
         prizes: updatedPrizes,
         participants: updatedParticipants,
         winners: [...filteredWinners, nextWinnerEntry],
         forfeitedAttendantIds: nextForfeitedIds,
         winnerId: ticketCode,
         activeWinnerId: ticketCode,
         activeWinnerRecordId: winner.id,
         isDrawingRequest: false,
         isSpinning: true,
         stoppedReels: 0,
         queuedManualStops: 0,
      });

      scheduleAutoReelStops(ticketCode.length, remainingInitialDelayMs, currentSeq);
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
      queuedManualStops: 0,
      drawMode: 'auto',
      showWinners: false,
      hideHud: false,
      notice: null,

      cleanupRealtime: () => {
         drawSequenceId += 1;
         clearAutoStopTimers();

         if (realtimeChannel) {
            void supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
         }

         set({
            isRealtimeConnected: false,
            isSpinning: false,
            isDrawingRequest: false,
            queuedManualStops: 0,
         });
      },

      loadGameData: async (gameId) => {
         drawSequenceId += 1;
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
               queuedManualStops: 0,
               notice: null,
            });
            return;
         }

         const isSameGame = get().gameId === gameId;

         set({
            gameId,
            isLoadingGame: true,
            queuedManualStops: 0,
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
            queuedManualStops: 0,
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
                     const currentState = get();
                     const nextForfeitedIds = latestState.data.participants
                        .filter((participant) => participant.isAbsentForfeited)
                        .map((participant) => participant.id);
                     const stillHasActiveWinner = Boolean(
                        currentState.activeWinnerRecordId &&
                           latestState.data.winners.some((winner) => winner.id === currentState.activeWinnerRecordId),
                     );

                     set({
                        participants: latestState.data.participants,
                        prizes: latestState.data.prizes,
                        winners: latestState.data.winners,
                        forfeitedAttendantIds: nextForfeitedIds,
                        ...(!stillHasActiveWinner && !currentState.isSpinning && !currentState.isDrawingRequest
                           ? {
                                activeWinnerId: null,
                                activeWinnerRecordId: null,
                             }
                           : {}),
                     });
                  }
               },
            )
            .subscribe((status) => {
               set({ isRealtimeConnected: status === 'SUBSCRIBED' });
            });
      },

      setCurrentPrize: (index) => {
         drawSequenceId += 1;
         clearAutoStopTimers();
         const placeholder = buildPlaceholderCode(get().participants);

         set({
            currentPrizeIndex: index,
            winnerId: placeholder,
            activeWinnerId: null,
            activeWinnerRecordId: null,
            isSpinning: false,
            isDrawingRequest: false,
            stoppedReels: 0,
            queuedManualStops: 0,
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

         if (!state.isSpinning || state.drawMode === 'instant') {
            return;
         }

         // Queue early manual stop presses while the draw API is still in-flight so no click is lost
         // and reels never lock onto placeholder characters.
         if (state.isDrawingRequest || !state.activeWinnerId) {
            set({
               queuedManualStops: state.queuedManualStops + 1,
            });
            return;
         }

         const totalReels = state.winnerId.length;

         // Ignore presses during the 2-second reveal pause once all reels have already stopped.
         if (state.stoppedReels >= totalReels) {
            return;
         }

         if (state.drawMode === 'auto') {
            clearAutoStopTimers();
         }

         const nextStopped = Math.min(totalReels, state.stoppedReels + 1);
         const isFinal = nextStopped >= totalReels;

         set({
            stoppedReels: nextStopped,
            isSpinning: true,
         });

         if (isFinal) {
            scheduleWinnerReveal(drawSequenceId);
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
