import { useCallback, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { toast } from 'sonner';

import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawAttendantCheckInBrowser } from '@admin-web/services/game-lucky-draw/attendant-check-in/browser';
import { useServicesGameLuckyDrawCheckInStats } from '@admin-web/services/game-lucky-draw/check-in-stats';
import { useServicesGameLuckyDrawGuardAttendantSearch } from '@admin-web/services/game-lucky-draw/guard-attendant-search';
import { useServicesGameLuckyDrawGuardAttendantUpdateRepresentative } from '@admin-web/services/game-lucky-draw/guard-attendant-update-representative';

import {
   CAMERA_SCAN_INTERVAL_MS,
   MODAL_ID,
   RECENT_HISTORY_LIMIT,
   SEARCH_DEBOUNCE_MS,
} from './constants';

import type * as Types from './type';

function playFeedbackTone(kind: 'SUCCESS' | 'ALREADY' | 'ERROR') {
   try {
      if (typeof window === 'undefined') {
         return;
      }

      const AudioContextClass =
         window.AudioContext ||
         (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
         return;
      }

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const scheduleTone = (
         frequency: number,
         startOffset: number,
         duration: number,
         type: OscillatorType = 'sine',
         gainPeak = 0.18,
      ) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();

         osc.type = type;
         osc.frequency.setValueAtTime(frequency, now + startOffset);

         gain.gain.setValueAtTime(0.0001, now + startOffset);
         gain.gain.exponentialRampToValueAtTime(gainPeak, now + startOffset + 0.015);
         gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

         osc.connect(gain);
         gain.connect(ctx.destination);

         osc.start(now + startOffset);
         osc.stop(now + startOffset + duration);
      };

      if (kind === 'SUCCESS') {
         scheduleTone(880, 0, 0.08, 'sine', 0.18);
         scheduleTone(1320, 0.08, 0.08, 'sine', 0.2);
         window.setTimeout(() => void ctx.close().catch(() => undefined), 250);
      } else if (kind === 'ALREADY') {
         scheduleTone(440, 0, 0.08, 'square', 0.12);
         scheduleTone(440, 0.12, 0.08, 'square', 0.12);
         window.setTimeout(() => void ctx.close().catch(() => undefined), 300);
      } else {
         scheduleTone(220, 0, 0.24, 'triangle', 0.22);
         window.setTimeout(() => void ctx.close().catch(() => undefined), 320);
      }
   } catch {
      // Ignore Web Audio API errors in restricted environments
   }
}

export function useLogic(
   properties: Types.Properties,
   scannerInputRef: React.RefObject<HTMLInputElement | null>,
   videoRef: React.RefObject<HTMLVideoElement | null>,
   canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
   const { gameId } = properties;

   const modalActions = useStoreModal((store) => store.actions);

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
      lastScannedPayload: '',
      isCameraActive: false,
      isCameraStarting: false,
      cameraError: '',
      searchKeyword: '',
      isSearching: false,
      searchResults: [],
      checkingInAttendantId: '',
      editingAttendant: null,
      representativeInput: '',
      isSavingRepresentative: false,
      previewRepresentativeInput: '',
      isConfirmingCheckIn: false,
      isSavingInlineRepresentative: false,
      lastResult: null,
      recentHistory: [],
   });

   const mediaStreamRef = useRef<MediaStream | null>(null);
   const scanIntervalRef = useRef<number | null>(null);
   const lastScannedRef = useRef<string>('');
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

      lastScannedRef.current = '';

      setState({
         isCameraActive: false,
         isCameraStarting: false,
         lastScannedPayload: '',
      });
   }, [setState, videoRef]);

   useEffect(() => {
      return () => {
         stopCamera();
      };
   }, [stopCamera]);

   const applyCheckInOutcome = useCallback(
      (
         response: {
            status: AdminWeb.Features.GameLuckyDraw.CheckIn.Status;
            attendant: Types.Attendant;
         },
         qrCodePayload?: string,
      ) => {
         const now = Date.now();

         if (response.status === 'PENDING_CONFIRMATION') {
            setState({
               lastResult: {
                  kind: 'PREVIEW',
                  attendant: response.attendant,
                  qrCodePayload,
                  at: now,
               },
               previewRepresentativeInput: response.attendant.representative ?? '',
            });

            playFeedbackTone('SUCCESS');
            return;
         }

         const isFirstCheckIn = response.status === 'CHECKED_IN';
         const kind = isFirstCheckIn ? 'SUCCESS' : 'ALREADY';

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
            previewRepresentativeInput: response.attendant.representative ?? '',
            lastResult: {
               kind,
               attendant: response.attendant,
               qrCodePayload,
               at: now,
            },
            recentHistory: nextRecent,
         });

         playFeedbackTone(kind);

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
         setState({
            isQrSubmitting: true,
            lastScannedPayload: payload,
         });

         const serviceCheckIn = await useServicesGameLuckyDrawAttendantCheckInBrowser({
            gameId,
            method: 'QR_SCAN',
            action: 'LOOKUP',
            qrCodePayload: payload,
         });

         isSubmittingRef.current = false;

         if (serviceCheckIn.error) {
            const errorMessage = localizeError(serviceCheckIn.message);

            setState({
               isQrSubmitting: false,
               qrInput: '',
               previewRepresentativeInput: '',
               lastResult: {
                  kind: 'ERROR',
                  message: errorMessage,
                  at: Date.now(),
               },
            });

            playFeedbackTone('ERROR');
            toast.error(errorMessage);
            scannerInputRef.current?.focus();
            return;
         }

         setState({
            isQrSubmitting: false,
            qrInput: '',
         });

         applyCheckInOutcome(serviceCheckIn.data, payload);
         scannerInputRef.current?.focus();
      },
      [applyCheckInOutcome, gameId, localizeError, scannerInputRef, setState],
   );

   const handleQrFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitQrPayload(state.qrInput);
   };

   const handleResetScan = useCallback(() => {
      lastScannedRef.current = '';
      setState({
         lastScannedPayload: '',
         lastResult: null,
         qrInput: '',
         previewRepresentativeInput: '',
      });

      if (state.qrMode === 'SCANNER') {
         scannerInputRef.current?.focus();
      }
   }, [scannerInputRef, setState, state.qrMode]);

   const handleConfirmQrCheckIn = useCallback(async () => {
      if (!gameId || !state.lastResult || state.lastResult.kind !== 'PREVIEW' || state.isConfirmingCheckIn) {
         return;
      }

      const targetResult = state.lastResult;
      setState(true, 'isConfirmingCheckIn');

      const serviceCheckIn = await useServicesGameLuckyDrawAttendantCheckInBrowser({
         gameId,
         method: 'QR_SCAN',
         action: 'CONFIRM',
         qrCodePayload: targetResult.qrCodePayload,
         attendantId: targetResult.attendant.id,
         representative: state.previewRepresentativeInput.trim() || null,
      });

      setState(false, 'isConfirmingCheckIn');

      if (serviceCheckIn.error) {
         const errorMessage = localizeError(serviceCheckIn.message);

         setState({
            lastResult: {
               kind: 'ERROR',
               message: errorMessage,
               at: Date.now(),
            },
         });

         playFeedbackTone('ERROR');
         toast.error(errorMessage);
         scannerInputRef.current?.focus();
         return;
      }

      applyCheckInOutcome(serviceCheckIn.data, targetResult.qrCodePayload);
      scannerInputRef.current?.focus();
   }, [
      applyCheckInOutcome,
      gameId,
      localizeError,
      scannerInputRef,
      setState,
      state.isConfirmingCheckIn,
      state.lastResult,
      state.previewRepresentativeInput,
   ]);

   const handleSaveInlineRepresentative = useCallback(async () => {
      if (
         !gameId ||
         !state.lastResult ||
         (state.lastResult.kind !== 'SUCCESS' && state.lastResult.kind !== 'ALREADY') ||
         state.isSavingInlineRepresentative
      ) {
         return;
      }

      const targetResult = state.lastResult;
      setState(true, 'isSavingInlineRepresentative');

      const serviceUpdate = await useServicesGameLuckyDrawGuardAttendantUpdateRepresentative({
         gameId,
         attendantId: targetResult.attendant.id,
         representative: state.previewRepresentativeInput.trim() || null,
      });

      setState(false, 'isSavingInlineRepresentative');

      if (serviceUpdate.error) {
         toast.error(localizeError(serviceUpdate.message));
         return;
      }

      const updatedAttendant = serviceUpdate.data;

      setState({
         searchResults: state.searchResults.map((item) =>
            item.id === updatedAttendant.id ? updatedAttendant : item,
         ),
         previewRepresentativeInput: updatedAttendant.representative ?? '',
         lastResult: {
            ...targetResult,
            attendant: updatedAttendant,
         },
         recentHistory: state.recentHistory.map((entry) =>
            entry.attendant.id === updatedAttendant.id
               ? {
                    ...entry,
                    attendant: updatedAttendant,
                 }
               : entry,
         ),
      });

      toast.success(
         translate('toast.representative_updated', {
            name: updatedAttendant.full_name,
            ticket: updatedAttendant.ticket_code,
         }),
      );
   }, [
      gameId,
      localizeError,
      setState,
      state.isSavingInlineRepresentative,
      state.lastResult,
      state.previewRepresentativeInput,
      state.recentHistory,
      state.searchResults,
      translate,
   ]);

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

            if (
               !video ||
               !canvas ||
               video.readyState !== video.HAVE_ENOUGH_DATA ||
               isSubmittingRef.current
            ) {
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
            if (!detectedPayload || detectedPayload === lastScannedRef.current) {
               return;
            }

            lastScannedRef.current = detectedPayload;
            setState(detectedPayload, 'lastScannedPayload');
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
         const serviceSearch = await useServicesGameLuckyDrawGuardAttendantSearch({
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

      const serviceCheckIn = await useServicesGameLuckyDrawAttendantCheckInBrowser({
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

         playFeedbackTone('ERROR');
         toast.error(errorMessage);
         return;
      }

      applyCheckInOutcome(serviceCheckIn.data);
   };

   const handleOpenEditRepresentative = (attendant: Types.Attendant) => {
      setState({
         editingAttendant: attendant,
         representativeInput: attendant.representative ?? '',
      });
      modalActions.openModal(MODAL_ID.EDIT_REPRESENTATIVE);
   };

   const handleCloseEditRepresentative = () => {
      modalActions.closeModal(MODAL_ID.EDIT_REPRESENTATIVE);
      setState({
         editingAttendant: null,
         representativeInput: '',
      });
   };

   const handleSaveRepresentative = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!gameId || !state.editingAttendant || state.isSavingRepresentative) {
         return;
      }

      const targetAttendant = state.editingAttendant;
      setState(true, 'isSavingRepresentative');

      const serviceUpdate = await useServicesGameLuckyDrawGuardAttendantUpdateRepresentative({
         gameId,
         attendantId: targetAttendant.id,
         representative: state.representativeInput.trim() || null,
      });

      setState(false, 'isSavingRepresentative');

      if (serviceUpdate.error) {
         toast.error(localizeError(serviceUpdate.message));
         return;
      }

      const updatedAttendant = serviceUpdate.data;

      setState({
         searchResults: state.searchResults.map((item) =>
            item.id === updatedAttendant.id ? updatedAttendant : item,
         ),
         lastResult:
            state.lastResult &&
            state.lastResult.kind !== 'ERROR' &&
            state.lastResult.attendant.id === updatedAttendant.id
               ? {
                    ...state.lastResult,
                    attendant: updatedAttendant,
                 }
               : state.lastResult,
         recentHistory: state.recentHistory.map((entry) =>
            entry.attendant.id === updatedAttendant.id
               ? {
                    ...entry,
                    attendant: updatedAttendant,
                 }
               : entry,
         ),
      });

      toast.success(
         translate('toast.representative_updated', {
            name: updatedAttendant.full_name,
            ticket: updatedAttendant.ticket_code,
         }),
      );

      handleCloseEditRepresentative();
   };

   const remainingCount = Math.max(0, state.totalCount - state.checkedInCount);
   const attendanceRate =
      state.totalCount > 0
         ? Math.min(100, Math.round((state.checkedInCount / state.totalCount) * 100))
         : 0;
   const cameraStatus: Types.Camera_Hud_Status = state.isQrSubmitting
      ? 'VERIFYING'
      : state.lastResult
        ? state.lastResult.kind
        : 'IDLE';
   const isSaveRepresentativeDisabled =
      state.isSavingRepresentative ||
      !state.editingAttendant ||
      state.representativeInput.trim() === (state.editingAttendant.representative ?? '').trim();
   const isInlineRepresentativeDirty =
      state.lastResult && state.lastResult.kind !== 'ERROR'
         ? state.previewRepresentativeInput.trim() !== (state.lastResult.attendant.representative ?? '').trim()
         : false;
   const isSaveInlineRepresentativeDisabled =
      state.isSavingInlineRepresentative || !isInlineRepresentativeDirty;

   return {
      state,
      param: {
         remainingCount,
         attendanceRate,
         isQrSubmitDisabled: state.isQrSubmitting || !state.qrInput.trim(),
         cameraStatus,
         canResetScan: Boolean(state.lastResult || state.lastScannedPayload),
         isSaveRepresentativeDisabled,
         isSaveInlineRepresentativeDisabled,
      },
      func: {
         translate,
         setState,
         fetchStats,
         handleQrFormSubmit,
         handleResetScan,
         handleConfirmQrCheckIn,
         handleSaveInlineRepresentative,
         handleSelectQrMode,
         startCamera,
         stopCamera,
         handleManualCheckIn,
         handleOpenEditRepresentative,
         handleCloseEditRepresentative,
         handleSaveRepresentative,
      },
   };
}

