import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { ROUTE } from '@admin-web/routes/constants';
import { useServicesAccountLogout } from '@admin-web/services/account/logout';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';
import { DRAW_MODES } from '@admin-web/stores/lucky-draw/constants';
import { useStoreSession } from '@admin-web/stores/session';

import {
   COMPACT_WIDTH_BREAKPOINT,
   DEFAULT_BOTTOM_RIGHT_OFFSET,
   DEFAULT_HEIGHT,
   DEFAULT_WIDTH,
   MIN_HEIGHT,
   MIN_WIDTH,
   RESIZE_DIRECTIONS,
   SHORT_HEIGHT_BREAKPOINT,
   STORAGE_KEY,
   VIEWPORT_MARGIN,
   WIDE_WIDTH_BREAKPOINT,
} from './constants';

import type * as Types from './type';

export { DRAW_MODES, RESIZE_DIRECTIONS };

const clamp = (value: number, min: number, max: number): number => {
   return Math.min(Math.max(value, min), max);
};

const clampRectToViewport = (
   rect: Types.BoxRect,
   vw: number,
   vh: number,
   renderedHeight?: number,
): Types.BoxRect => {
   const maxWidth = Math.max(120, vw - VIEWPORT_MARGIN * 2);
   const maxHeight = Math.max(120, vh - VIEWPORT_MARGIN * 2);
   const effectiveMinWidth = Math.min(MIN_WIDTH, maxWidth);
   const effectiveMinHeight = Math.min(MIN_HEIGHT, maxHeight);

   const width = Math.round(clamp(rect.width, effectiveMinWidth, maxWidth));
   const height = Math.round(clamp(rect.height, effectiveMinHeight, maxHeight));
   const effectiveHeight = renderedHeight ? Math.min(height, Math.round(renderedHeight)) : height;
   const maxX = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);
   const maxY = Math.max(VIEWPORT_MARGIN, vh - effectiveHeight - VIEWPORT_MARGIN);
   const x = Math.round(clamp(rect.x, VIEWPORT_MARGIN, maxX));
   const y = Math.round(clamp(rect.y, VIEWPORT_MARGIN, maxY));

   return { x, y, width, height };
};

const getDefaultRect = (vw: number, vh: number, renderedHeight?: number): Types.BoxRect => {
   const clampedWidth = Math.min(DEFAULT_WIDTH, Math.max(120, vw - VIEWPORT_MARGIN * 2));
   const clampedHeight = Math.min(DEFAULT_HEIGHT, Math.max(120, vh - VIEWPORT_MARGIN * 2));
   const visibleHeight = renderedHeight ? Math.min(clampedHeight, Math.round(renderedHeight)) : clampedHeight;

   return clampRectToViewport(
      {
         x: vw - clampedWidth - DEFAULT_BOTTOM_RIGHT_OFFSET,
         y: vh - visibleHeight - DEFAULT_BOTTOM_RIGHT_OFFSET,
         width: clampedWidth,
         height: clampedHeight,
      },
      vw,
      vh,
      visibleHeight,
   );
};

const readStoredRect = (): Types.BoxRect | null => {
   try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
         return null;
      }

      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
         return null;
      }

      const candidate = parsed as Partial<Types.BoxRect>;
      if (
         typeof candidate.x === 'number' &&
         Number.isFinite(candidate.x) &&
         typeof candidate.y === 'number' &&
         Number.isFinite(candidate.y) &&
         typeof candidate.width === 'number' &&
         Number.isFinite(candidate.width) &&
         typeof candidate.height === 'number' &&
         Number.isFinite(candidate.height)
      ) {
         return {
            x: candidate.x,
            y: candidate.y,
            width: candidate.width,
            height: candidate.height,
         };
      }

      return null;
   } catch {
      return null;
   }
};

const persistRect = (rect: Types.BoxRect): void => {
   try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rect));
   } catch {
      // Ignore storage quota or restricted context errors
   }
};

const clearStoredRect = (): void => {
   try {
      window.localStorage.removeItem(STORAGE_KEY);
   } catch {
      // Ignore restricted context errors
   }
};

export function useLogic() {
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: 'features.operator.controls',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [boxRect, setBoxRect] = useState<Types.BoxRect | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [isResizing, setIsResizing] = useState(false);

   const containerRef = useRef<HTMLDivElement | null>(null);
   const boxRectRef = useRef<Types.BoxRect | null>(null);
   const isInteractingRef = useRef(false);
   const cleanupInteractionRef = useRef<(() => void) | null>(null);

   const events = useStoreSession((s) => s.events);
   const selectedEventId = useStoreSession((s) => s.selectedEventId);
   const selectedGameId = useStoreSession((s) => s.selectedGameId);
   const isLoadingAssignments = useStoreSession((s) => s.isLoadingAssignments);
   const setUnauthenticated = useStoreSession((s) => s.setUnauthenticated);

   const storeGameId = useStoreLuckyDraw((s) => s.gameId);
   const prizes = useStoreLuckyDraw((s) => s.prizes);
   const winners = useStoreLuckyDraw((s) => s.winners);
   const currentPrizeIndex = useStoreLuckyDraw((s) => s.currentPrizeIndex);
   const activeWinnerId = useStoreLuckyDraw((s) => s.activeWinnerId);
   const activeWinnerRecordId = useStoreLuckyDraw((s) => s.activeWinnerRecordId);
   const isSpinning = useStoreLuckyDraw((s) => s.isSpinning);
   const isDrawingRequest = useStoreLuckyDraw((s) => s.isDrawingRequest);
   const isLoadingGame = useStoreLuckyDraw((s) => s.isLoadingGame);
   const stoppedReels = useStoreLuckyDraw((s) => s.stoppedReels);
   const queuedManualStops = useStoreLuckyDraw((s) => s.queuedManualStops);
   const winnerId = useStoreLuckyDraw((s) => s.winnerId);
   const drawMode = useStoreLuckyDraw((s) => s.drawMode);
   const hideHud = useStoreLuckyDraw((s) => s.hideHud);
   const notice = useStoreLuckyDraw((s) => s.notice);

   const loadGameData = useStoreLuckyDraw((s) => s.loadGameData);
   const cleanupRealtime = useStoreLuckyDraw((s) => s.cleanupRealtime);
   const setCurrentPrize = useStoreLuckyDraw((s) => s.setCurrentPrize);
   const setDrawMode = useStoreLuckyDraw((s) => s.setDrawMode);
   const clearNotice = useStoreLuckyDraw((s) => s.clearNotice);
   const startDraw = useStoreLuckyDraw((s) => s.startDraw);
   const handleManualStop = useStoreLuckyDraw((s) => s.handleManualStop);
   const redrawAbsentWinner = useStoreLuckyDraw((s) => s.redrawAbsentWinner);

   useEffect(() => {
      const clampCurrentToViewport = (shouldPersist = true) => {
         const current = boxRectRef.current;
         if (!current || isInteractingRef.current) {
            return;
         }

         const renderedHeight = containerRef.current?.offsetHeight || undefined;
         const clamped = clampRectToViewport(current, window.innerWidth, window.innerHeight, renderedHeight);
         if (
            clamped.x !== current.x ||
            clamped.y !== current.y ||
            clamped.width !== current.width ||
            clamped.height !== current.height
         ) {
            boxRectRef.current = clamped;
            setBoxRect(clamped);
            if (shouldPersist) {
               persistRect(clamped);
            }
         }
      };

      const hydrateFrameId = window.requestAnimationFrame(() => {
         if (boxRectRef.current) {
            return;
         }

         const renderedHeight = containerRef.current?.offsetHeight || undefined;
         const stored = readStoredRect();
         const initialRect = stored
            ? clampRectToViewport(stored, window.innerWidth, window.innerHeight, renderedHeight)
            : getDefaultRect(window.innerWidth, window.innerHeight, renderedHeight);

         boxRectRef.current = initialRect;
         setBoxRect(initialRect);
      });

      const handleResize = () => {
         clampCurrentToViewport(true);
      };

      const handleFullscreenChange = () => {
         clampCurrentToViewport(true);
         window.requestAnimationFrame(() => clampCurrentToViewport(true));
      };

      const resizeObserver =
         typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => {
                 clampCurrentToViewport(false);
              })
            : null;

      if (resizeObserver && containerRef.current) {
         resizeObserver.observe(containerRef.current);
      }

      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
         window.cancelAnimationFrame(hydrateFrameId);
         resizeObserver?.disconnect();
         window.removeEventListener('resize', handleResize);
         document.removeEventListener('fullscreenchange', handleFullscreenChange);
         cleanupInteractionRef.current?.();
      };
   }, []);

   const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
         return;
      }

      if (event.target instanceof HTMLElement && event.target.closest('button')) {
         return;
      }

      event.preventDefault();
      cleanupInteractionRef.current?.();

      const renderedHeight = containerRef.current?.offsetHeight || undefined;
      const startRect = boxRectRef.current ?? getDefaultRect(window.innerWidth, window.innerHeight, renderedHeight);
      const dragWidth = containerRef.current?.offsetWidth || startRect.width;
      const dragHeight = renderedHeight ?? startRect.height;
      const startClientX = event.clientX;
      const startClientY = event.clientY;
      const pointerTarget = event.currentTarget;
      const pointerId = event.pointerId;

      try {
         pointerTarget.setPointerCapture(pointerId);
      } catch {
         // Ignore capture errors in synthetic or restricted pointer events
      }

      isInteractingRef.current = true;
      boxRectRef.current = startRect;
      setBoxRect(startRect);
      setIsDragging(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
         const dx = moveEvent.clientX - startClientX;
         const dy = moveEvent.clientY - startClientY;
         const vw = window.innerWidth;
         const vh = window.innerHeight;
         const maxX = Math.max(VIEWPORT_MARGIN, vw - dragWidth - VIEWPORT_MARGIN);
         const maxY = Math.max(VIEWPORT_MARGIN, vh - dragHeight - VIEWPORT_MARGIN);

         const nextRect: Types.BoxRect = {
            x: Math.round(clamp(startRect.x + dx, VIEWPORT_MARGIN, maxX)),
            y: Math.round(clamp(startRect.y + dy, VIEWPORT_MARGIN, maxY)),
            width: startRect.width,
            height: startRect.height,
         };

         boxRectRef.current = nextRect;
         setBoxRect(nextRect);
      };

      const finishDrag = () => {
         window.removeEventListener('pointermove', handlePointerMove);
         window.removeEventListener('pointerup', finishDrag);
         window.removeEventListener('pointercancel', finishDrag);
         cleanupInteractionRef.current = null;
         isInteractingRef.current = false;

         try {
            if (pointerTarget.hasPointerCapture(pointerId)) {
               pointerTarget.releasePointerCapture(pointerId);
            }
         } catch {
            // Ignore capture release errors
         }

         setIsDragging(false);

         if (boxRectRef.current) {
            persistRect(boxRectRef.current);
         }
      };

      cleanupInteractionRef.current = finishDrag;
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', finishDrag);
      window.addEventListener('pointercancel', finishDrag);
   }, []);

   const handleResizeStart = useCallback(
      (direction: Types.ResizeDirection, event: React.PointerEvent<HTMLDivElement>) => {
         if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
         }

         event.stopPropagation();
         event.preventDefault();
         cleanupInteractionRef.current?.();

         const renderedHeight = containerRef.current?.offsetHeight || undefined;
         const startRect = boxRectRef.current ?? getDefaultRect(window.innerWidth, window.innerHeight, renderedHeight);
         const baseHeight = renderedHeight ?? startRect.height;
         const startClientX = event.clientX;
         const startClientY = event.clientY;
         const pointerTarget = event.currentTarget;
         const pointerId = event.pointerId;

         try {
            pointerTarget.setPointerCapture(pointerId);
         } catch {
            // Ignore capture errors in synthetic or restricted pointer events
         }

         isInteractingRef.current = true;
         boxRectRef.current = startRect;
         setBoxRect(startRect);
         setIsResizing(true);

         const handlePointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startClientX;
            const dy = moveEvent.clientY - startClientY;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const maxViewportWidth = Math.max(120, vw - VIEWPORT_MARGIN * 2);
            const maxViewportHeight = Math.max(120, vh - VIEWPORT_MARGIN * 2);
            const effectiveMinWidth = Math.min(MIN_WIDTH, maxViewportWidth);
            const effectiveMinHeight = Math.min(MIN_HEIGHT, maxViewportHeight);

            let nextX = startRect.x;
            let nextY = startRect.y;
            let nextWidth = startRect.width;
            let nextHeight = startRect.height;

            if (direction.includes('e')) {
               const maxEastWidth = Math.max(effectiveMinWidth, vw - startRect.x - VIEWPORT_MARGIN);
               nextWidth = clamp(startRect.width + dx, effectiveMinWidth, maxEastWidth);
            }

            if (direction.includes('w')) {
               const maxWestWidth = Math.max(effectiveMinWidth, startRect.x + startRect.width - VIEWPORT_MARGIN);
               nextWidth = clamp(startRect.width - dx, effectiveMinWidth, maxWestWidth);
               nextX = startRect.x + (startRect.width - nextWidth);
            }

            if (direction.includes('s')) {
               const maxSouthHeight = Math.max(effectiveMinHeight, vh - startRect.y - VIEWPORT_MARGIN);
               nextHeight = clamp(baseHeight + dy, effectiveMinHeight, maxSouthHeight);
            }

            if (direction.includes('n')) {
               const maxNorthHeight = Math.max(effectiveMinHeight, startRect.y + baseHeight - VIEWPORT_MARGIN);
               nextHeight = clamp(baseHeight - dy, effectiveMinHeight, maxNorthHeight);
               nextY = startRect.y + (baseHeight - nextHeight);
            }

            const nextRect: Types.BoxRect = {
               x: Math.round(nextX),
               y: Math.round(nextY),
               width: Math.round(nextWidth),
               height: Math.round(nextHeight),
            };

            boxRectRef.current = nextRect;
            setBoxRect(nextRect);
         };

         const finishResize = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishResize);
            window.removeEventListener('pointercancel', finishResize);
            cleanupInteractionRef.current = null;
            isInteractingRef.current = false;

            try {
               if (pointerTarget.hasPointerCapture(pointerId)) {
                  pointerTarget.releasePointerCapture(pointerId);
               }
            } catch {
               // Ignore capture release errors
            }

            setIsResizing(false);

            if (boxRectRef.current) {
               const currentRenderedHeight = containerRef.current?.offsetHeight || undefined;
               const settled = clampRectToViewport(
                  boxRectRef.current,
                  window.innerWidth,
                  window.innerHeight,
                  currentRenderedHeight,
               );
               boxRectRef.current = settled;
               setBoxRect(settled);
               persistRect(settled);
            }
         };

         cleanupInteractionRef.current = finishResize;
         window.addEventListener('pointermove', handlePointerMove);
         window.addEventListener('pointerup', finishResize);
         window.addEventListener('pointercancel', finishResize);
      },
      [],
   );

   const handleResetBox = useCallback(() => {
      cleanupInteractionRef.current?.();
      clearStoredRect();

      const nextRect = getDefaultRect(
         window.innerWidth,
         window.innerHeight,
         containerRef.current?.offsetHeight || undefined,
      );
      boxRectRef.current = nextRect;
      setBoxRect(nextRect);

      window.requestAnimationFrame(() => {
         const settledHeight = containerRef.current?.offsetHeight || undefined;
         const settledRect = getDefaultRect(window.innerWidth, window.innerHeight, settledHeight);
         boxRectRef.current = settledRect;
         setBoxRect(settledRect);
      });
   }, []);

   const activeWidth = boxRect?.width ?? DEFAULT_WIDTH;
   const activeHeight = boxRect?.height ?? DEFAULT_HEIGHT;

   const layoutMode: Types.LayoutMode =
      activeWidth >= WIDE_WIDTH_BREAKPOINT ? 'wide' : activeWidth < COMPACT_WIDTH_BREAKPOINT ? 'compact' : 'standard';

   const heightMode: Types.HeightMode = activeHeight < SHORT_HEIGHT_BREAKPOINT ? 'short' : 'regular';

   const containerStyle = useMemo<CSSProperties>(() => {
      if (!boxRect) {
         return {
            right: DEFAULT_BOTTOM_RIGHT_OFFSET,
            bottom: DEFAULT_BOTTOM_RIGHT_OFFSET,
            width: DEFAULT_WIDTH,
            maxHeight: DEFAULT_HEIGHT,
         };
      }

      return {
         left: boxRect.x,
         top: boxRect.y,
         width: boxRect.width,
         maxHeight: boxRect.height,
      };
   }, [boxRect]);

   const activeGameId = selectedGameId || storeGameId;
   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const selectedGame = selectedEvent?.games.find((item) => item.id === activeGameId) ?? null;
   const isLuckyDrawGame = !selectedGame || selectedGame.game_type === 'LUCKY_DRAW';

   const hiddenTicketCode = isSpinning ? winnerId : null;

   const wonByPrize = useMemo(() => {
      const counts = new Map<string, number>();

      for (const w of winners) {
         if (w.ticketCode !== hiddenTicketCode) {
            counts.set(w.prizeId, (counts.get(w.prizeId) ?? 0) + 1);
         }
      }

      return counts;
   }, [winners, hiddenTicketCode]);

   const busy = isSpinning || isDrawingRequest || isLoadingGame || isLoadingAssignments;
   const currentPrize = prizes[currentPrizeIndex] ?? null;
   const currentPrizeDone = Boolean(currentPrize && currentPrize.remainingQuantity <= 0 && !isSpinning);
   const canRedrawAbsent = Boolean(!isSpinning && !isDrawingRequest && activeWinnerRecordId && activeWinnerId);

   const localizedNotice = useMemo(() => {
      if (!notice) {
         return null;
      }

      return {
         kind: notice.kind,
         text: notice.text.startsWith('services.') ? translateRoot(notice.text) : notice.text,
      };
   }, [notice, translateRoot]);

   function handlePrizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setCurrentPrize(Number(e.target.value));
      e.currentTarget.blur();
   }

   function handleSyncGame() {
      if (activeGameId && isLuckyDrawGame) {
         void loadGameData(activeGameId);
      }
   }

   function handleStartDraw() {
      void startDraw();
   }

   function handleRedrawAbsent() {
      void redrawAbsentWinner();
   }

   async function handleLogout() {
      cleanupRealtime();
      await useServicesAccountLogout();
      setUnauthenticated();
      router.replace(ROUTE.AUTHORIZE.LOGIN);
      router.refresh();
   }

   return {
      containerRef,
      param: {
         hideHud,
         containerStyle,
         layoutMode,
         heightMode,
         isDragging,
         isResizing,
         isInteracting: isDragging || isResizing,
         isLuckyDrawGame,
         prizes,
         currentPrizeIndex,
         currentPrizeDone,
         wonByPrize,
         busy,
         isSpinning,
         isDrawingRequest,
         isLoadingGame: isLoadingGame || isLoadingAssignments,
         stoppedReels,
         queuedManualStops,
         winnerLength: winnerId.length,
         activeWinnerId,
         canRedrawAbsent,
         drawMode,
         notice: localizedNotice,
      },
      func: {
         translate,
         clearNotice,
         handleDragStart,
         handleResizeStart,
         handleResetBox,
         handlePrizeChange,
         handleSyncGame,
         setDrawMode,
         handleStartDraw,
         handleManualStop,
         handleRedrawAbsent,
         handleLogout,
      },
   };
}
