import { useCallback, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawAttendantHistorySearch } from '@admin-web/services/game-lucky-draw/attendant-history-search';
import { useServicesGameLuckyDrawAttendantSave } from '@admin-web/services/game-lucky-draw/attendant-save';

import { SALUTATION_OPTIONS, schema } from './constants';

import type * as Types from './type';

const getInitialValues = (attendant?: Types.Attendant | null): Types.FormValues => ({
   salutation: (attendant?.salutation as Types.Salutation | null) ?? '',
   full_name: attendant?.full_name ?? '',
   citizen_id: attendant?.citizen_id ?? '',
   ticket_code: attendant?.ticket_code ?? '',
   email: attendant?.email ?? '',
   phone: attendant?.phone ?? '',
   company_name: attendant?.company_name ?? '',
   department: attendant?.department ?? '',
   representative_salutation: (attendant?.representative_salutation as Types.Salutation | null) ?? '',
   representative: attendant?.representative ?? '',
   representative_phone: attendant?.representative_phone ?? '',
   sale_in_charge: attendant?.sale_in_charge ?? '',
   accommodation: Boolean(attendant?.accommodation),
   is_checked_in: Boolean(attendant?.is_checked_in),
   is_draw_eligible: attendant ? Boolean(attendant.is_draw_eligible) : true,
});

export function useLogic(properties: Types.Properties) {
   const { gameId, attendant = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = attendant ? 'edit' : 'create';
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.attendant_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [historyState, setHistoryState] = useDeepState<Types.HistoryState>({
      activeTab: 'info',
      isLoading: false,
      entries: [],
      loadedAttendantId: '',
      error: '',
   });

   const { formState, register, handleSubmit, reset } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(attendant),
      mode: 'onChange',
   });

   useEffect(() => {
      reset(getInitialValues(attendant));
      setHistoryState({
         activeTab: 'info',
         entries: [],
         loadedAttendantId: '',
         error: '',
      });
   }, [attendant, reset, setHistoryState]);

   const fetchHistory = useCallback(async () => {
      if (!gameId || !attendant?.id) {
         return;
      }

      setHistoryState({
         isLoading: true,
         error: '',
      });

      const result = await useServicesGameLuckyDrawAttendantHistorySearch({
         gameId,
         attendantId: attendant.id,
      });

      if (result.error) {
         const localizedError = result.message.startsWith('services.')
            ? translateRoot(result.message)
            : result.message;

         setHistoryState({
            isLoading: false,
            error: localizedError,
         });
         return;
      }

      setHistoryState({
         isLoading: false,
         entries: result.data.entries,
         loadedAttendantId: attendant.id,
         error: '',
      });
   }, [attendant, gameId, setHistoryState, translateRoot]);

   const handleSelectTab = (tab: Types.Tab) => {
      if (tab === historyState.activeTab) {
         return;
      }

      setHistoryState(tab, 'activeTab');

      if (tab === 'history' && attendant?.id && historyState.loadedAttendantId !== attendant.id) {
         void fetchHistory();
      }
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameLuckyDrawAttendantSave({
            id: attendant?.id,
            gameId,
            salutation: (values.salutation || null) as Types.Salutation | null,
            full_name: values.full_name,
            citizen_id: values.citizen_id || null,
            ticket_code: values.ticket_code,
            email: values.email || null,
            phone: values.phone || null,
            company_name: values.company_name || null,
            department: values.department || null,
            representative_salutation: (values.representative_salutation || null) as Types.Salutation | null,
            representative: values.representative || null,
            representative_phone: values.representative_phone || null,
            sale_in_charge: values.sale_in_charge || null,
            accommodation: Boolean(values.accommodation),
            is_checked_in: Boolean(values.is_checked_in),
            is_draw_eligible: Boolean(values.is_draw_eligible),
         });

         if (saveResult.error) {
            const localizedError = saveResult.message.startsWith('services.')
               ? translateRoot(saveResult.message)
               : saveResult.message;

            toast.error(localizedError);
            return;
         }

         toast.success(translate(`toast.${mode}_success`));
         reset(getInitialValues(saveResult.data.attendant));
         onSuccess?.(saveResult.data.attendant);
      });
   });

   return {
      param: {
         mode,
         attendant,
         salutationOptions: SALUTATION_OPTIONS,
         isPending,
         isSubmitDisabled: isPending || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
         activeTab: mode === 'edit' ? historyState.activeTab : 'info',
         historyEntries: historyState.entries,
         isHistoryLoading: historyState.isLoading,
         hasLoadedHistory: Boolean(attendant?.id && historyState.loadedAttendantId === attendant.id),
         historyError: historyState.error,
      },
      func: {
         translate,
         register,
         onSubmit,
         onCancel,
         handleSelectTab,
         fetchHistory,
      },
   };
}
