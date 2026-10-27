import { useCallback, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';

import { useDeepState } from '@client-app/hooks/deep-state';
import { useTranslate } from '@client-app/locale';
import { useServicesGameLuckyDrawAttendantCheckIn } from '@client-app/services/game-lucky-draw/attendant-check-in';
import { useServicesGameLuckyDrawAttendantSearch } from '@client-app/services/game-lucky-draw/attendant-search';
import { useServicesGameLuckyDrawCheckInStats } from '@client-app/services/game-lucky-draw/check-in-stats';

import {
   CAMERA_DUPLICATE_COOLDOWN_MS,
   CAMERA_SCAN_INTERVAL_MS,
   RECENT_HISTORY_LIMIT,
   SEARCH_DEBOUNCE_MS,
} from './constants';

import type * as Types from './type';

export function useLogic(
   properties: Types.Properties,
   scannerInputRef: React.RefObject<HTMLInputElement | null>,
   videoRef: React.RefObject<HTMLVideoElement | null>,
   canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
   const { gameId } = properties;

   const { translate } = useTranslate({
      prefix: 'features.guard.check_in',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      totalCount: 0,
      checkedInCount: 0,
      isStatsLoading: false,
      qrMode: 'SCANNER',
      qrInput: '',
      isQrSubmitting: false,
      isCameraActive: false,
      isCameraStarting: false,
      cameraError: '',
      searchKeyword: '',
      isSearching: false,
      searchResults: [],
      checkingInAttendantId: '',
      lastResult: null,
      recentHistory: [],
   });

   const mediaStreamRef = useRef<MediaStream | null>(null);
   const scanIntervalRef = useRef<number | null>(null);
   const lastScannedRef = useRef<{ payload: string; at: number }>({ payload: '', at: 0 });
   const isSubmittingRef = useRef(false);

   const localizeError = useCallback(
      (message: string) => {
         return message.startsWith('services.') ? translateRoot(message) : message;
      },
      [translateRoot],
   );

   const fetchStats = useCallback(async () => {
      if (!gameId) {
         return;
      }

      setState(true, 'isStatsLoading');

      const serviceStats = await useServicesGameLuckyDrawCheckInStats({ gameId });

      if (serviceStats.error) {
         setState(false, 'isStatsLoading');
         return;
      }

      setState({
         totalCount: serviceStats.data.total,
         checkedInCount: serviceStats.data.checkedIn,
         isStatsLoading: false,
      });
   }, [gameId, setState]);

   useEffect(() => {
      void fetchStats();
   }, [fetchStats]);

   const stopCamera = useCallback(() => {
      if (scanIntervalRef.current !== null) {
         window.clearInterval(scanIntervalRef.current);
         scanIntervalRef.current = null;
      }

      if (mediaStreamRef.current) {
         mediaStreamRef.current.getTracks().forEach((track) => track.stop());
         mediaStreamRef.current = null;
      }

      if (videoRef.current) {
         videoRef.current.srcObject = null;
      }

      setState({
         isCameraActive: false,
         isCameraStarting: false,
      });
   }, [setState, videoRef]);

   useEffect(() => {
      return () => {
         stopCamera();
      };
   }, [stopCamera]);

   const applyCheckInOutcome = useCallback(
      (response: { status: ClientApp.Features.GameLuckyDraw.CheckIn.Status; attendant: Types.Attendant }) => {
         const now = Date.now();
         const isFirstCheckIn = response.status === 'CHECKED_IN';

         const updatedResults = state.searchResults.map((item) =>
            item.id === response.attendant.id ? response.attendant : item,
         );

         const nextRecent: Types.Recent_Entry[] = [
            {
               attendant: response.attendant,
               status: response.status,
               at: now,
            },
            ...state.recentHistory.filter((entry) => entry.attendant.id !== response.attendant.id),
         ].slice(0, RECENT_HISTORY_LIMIT);

         setState({
            checkedInCount: isFirstCheckIn ? state.checkedInCount + 1 : state.checkedInCount,
            searchResults: updatedResults,
            lastResult: {
               kind: isFirstCheckIn ? 'SUCCESS' : 'ALREADY',
               attendant: response.attendant,
               at: now,
            },
            recentHistory: nextRecent,
         });

         if (isFirstCheckIn) {
            toast.success(
               translate('toast.check_in_success', {
                  name: response.attendant.full_name,
                  ticket: response.attendant.ticket_code,
               }),
            );
         } else {
            toast.warning(
               translate('toast.already_checked_in', {
                  name: response.attendant.full_name,
                  ticket: response.attendant.ticket_code,
               }),
            );
         }
      },
      [setState, state.checkedInCount, state.recentHistory, state.searchResults, translate],
   );

   const submitQrPayload = useCallback(
      async (rawPayload: string) => {
         const payload = rawPayload.trim();

         if (!payload || !gameId || isSubmittingRef.current) {
            return;
         }

         isSubmittingRef.current = true;
         setState(true, 'isQrSubmitting');

         const serviceCheckIn = await useServicesGameLuckyDrawAttendantCheckIn({
            gameId,
            method: 'QR_SCAN',
            qrCodePayload: payload,
         });

         isSubmittingRef.current = false;

         if (serviceCheckIn.error) {
            const errorMessage = localizeError(serviceCheckIn.message);

            setState({
               isQrSubmitting: false,
               qrInput: '',
               lastResult: {
                  kind: 'ERROR',
                  message: errorMessage,
                  at: Date.now(),
               },
            });

            toast.error(errorMessage);
            scannerInputRef.current?.focus();
            return;
         }

         setState({
            isQrSubmitting: false,
            qrInput: '',
         });

         applyCheckInOutcome(serviceCheckIn.data);
         scannerInputRef.current?.focus();
      },
      [applyCheckInOutcome, gameId, localizeError, scannerInputRef, setState],
   );

   const handleQrFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitQrPayload(state.qrInput);
   };

   const startCamera = useCallback(async () => {
      if (state.isCameraActive || state.isCameraStarting) {
         return;
      }

      setState({
         isCameraStarting: true,
         cameraError: '',
      });

      try {
         const stream = await navigator.mediaDevices.getUserMedia({
            video: {
               facingMode: 'environment',
               width: { ideal: 640 },
               height: { ideal: 480 },
            },
            audio: false,
         });

         mediaStreamRef.current = stream;

         if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
         }

         setState({
            isCameraActive: true,
            isCameraStarting: false,
         });

         scanIntervalRef.current = window.setInterval(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || isSubmittingRef.current) {
               return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) {
               return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
               inversionAttempts: 'dontInvert',
            });

            const detectedPayload = qrCode?.data?.trim() ?? '';
            if (!detectedPayload) {
               return;
            }

            const now = Date.now();
            if (
               lastScannedRef.current.payload === detectedPayload &&
               now - lastScannedRef.current.at < CAMERA_DUPLICATE_COOLDOWN_MS
            ) {
               return;
            }

            lastScannedRef.current = { payload: detectedPayload, at: now };
            void submitQrPayload(detectedPayload);
         }, CAMERA_SCAN_INTERVAL_MS);
      } catch {
         stopCamera();
         setState({
            isCameraStarting: false,
            cameraError: translate('qr.camera_error'),
         });
      }
   }, [
      canvasRef,
      setState,
      state.isCameraActive,
      state.isCameraStarting,
      stopCamera,
      submitQrPayload,
      translate,
      videoRef,
   ]);

   const handleSelectQrMode = (mode: Types.Qr_Mode) => {
      if (mode === state.qrMode) {
         return;
      }

      if (mode === 'SCANNER') {
         stopCamera();
         setState({ qrMode: 'SCANNER', cameraError: '' });
         window.setTimeout(() => scannerInputRef.current?.focus(), 50);
         return;
      }

      setState({ qrMode: 'CAMERA', cameraError: '' });
      void startCamera();
   };

   useEffect(() => {
      const keyword = state.searchKeyword.trim();

      if (!keyword || !gameId) {
         setState({
            searchResults: [],
            isSearching: false,
         });
         return;
      }

      setState(true, 'isSearching');

      const timer = window.setTimeout(async () => {
         const serviceSearch = await useServicesGameLuckyDrawAttendantSearch({
            gameId,
            keyword,
         });

         if (serviceSearch.error) {
            setState(false, 'isSearching');
            return;
         }

         setState({
            searchResults: serviceSearch.data,
            isSearching: false,
         });
      }, SEARCH_DEBOUNCE_MS);

      return () => {
         window.clearTimeout(timer);
      };
   }, [gameId, setState, state.searchKeyword]);

   const handleManualCheckIn = async (attendant: Types.Attendant) => {
      if (!gameId || state.checkingInAttendantId) {
         return;
      }

      setState(attendant.id, 'checkingInAttendantId');

      const serviceCheckIn = await useServicesGameLuckyDrawAttendantCheckIn({
         gameId,
         method: 'MANUAL_SEARCH',
         attendantId: attendant.id,
         searchQuery: state.searchKeyword.trim() || attendant.ticket_code,
      });

      setState('', 'checkingInAttendantId');

      if (serviceCheckIn.error) {
         const errorMessage = localizeError(serviceCheckIn.message);

         setState({
            lastResult: {
               kind: 'ERROR',
               message: errorMessage,
               at: Date.now(),
            },
         });

         toast.error(errorMessage);
         return;
      }

      applyCheckInOutcome(serviceCheckIn.data);
   };

   const remainingCount = Math.max(0, state.totalCount - state.checkedInCount);
   const attendanceRate =
      state.totalCount > 0 ? Math.min(100, Math.round((state.checkedInCount / state.totalCount) * 100)) : 0;

   return {
      state,
      param: {
         remainingCount,
         attendanceRate,
         isQrSubmitDisabled: state.isQrSubmitting || !state.qrInput.trim(),
      },
      func: {
         translate,
         setState,
         fetchStats,
         handleQrFormSubmit,
         handleSelectQrMode,
         startCamera,
         stopCamera,
         handleManualCheckIn,
      },
   };
}
