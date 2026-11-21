import { useCallback, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import {
   useServicesGameLuckyDrawVipAccommodationConfirm,
   useServicesGameLuckyDrawVipAccommodationRead,
   useServicesGameLuckyDrawVipAccommodationUpdate,
} from '@admin-web/services/game-lucky-draw/vip-accommodation';
import type { VipAttendantInfo } from '@admin-web/services/game-lucky-draw/vip-accommodation/type';

import { SALUTATION_OPTIONS, schema } from './constants';

import type * as Types from './type';

const getInitialValues = (attendant?: VipAttendantInfo | null): Types.FormValues => ({
   salutation: (attendant?.salutation as Types.Salutation | null) ?? '',
   full_name: attendant?.full_name ?? '',
   citizen_id: attendant?.citizen_id ?? '',
   email: attendant?.email ?? '',
   phone: attendant?.phone ?? '',
});

export function useLogic(properties: Types.Properties) {
   const { initialToken, initialAction } = properties;

   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.vip_accommodation',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      mode: 'loading',
      attendant: null,
      errorMessage: '',
      submitError: '',
      wasUpdated: false,
   });

   const { formState, register, handleSubmit, reset } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(null),
      mode: 'onChange',
   });

   const resolveErrorMessage = useCallback(
      (message: string) => {
         return message.startsWith('services.') ? translateRoot(message) : message;
      },
      [translateRoot],
   );

   useEffect(() => {
      let cancelled = false;

      const initialize = async () => {
         if (!initialToken.trim()) {
            setState({
               mode: 'error',
               attendant: null,
               errorMessage: translateRoot('services.game_lucky_draw.attendant.vip_link_invalid'),
            });
            return;
         }

         setState({
            mode: 'loading',
            errorMessage: '',
            submitError: '',
         });

         const result =
            initialAction === 'edit'
               ? await useServicesGameLuckyDrawVipAccommodationRead({ token: initialToken })
               : await useServicesGameLuckyDrawVipAccommodationConfirm({ token: initialToken });

         if (cancelled) {
            return;
         }

         if (result.error) {
            setState({
               mode: 'error',
               attendant: null,
               errorMessage: resolveErrorMessage(result.message),
            });
            return;
         }

         if (!result.data) {
            setState({
               mode: 'error',
               attendant: null,
               errorMessage: translate('error.fallback'),
            });
            return;
         }

         if (initialAction === 'edit' && result.data.attendant.isEditExpired) {
            setState({
               mode: 'error',
               attendant: result.data.attendant,
               errorMessage: translateRoot('services.game_lucky_draw.attendant.vip_edit_expired'),
               wasUpdated: false,
            });
            return;
         }

         reset(getInitialValues(result.data.attendant));
         setState({
            mode: initialAction === 'edit' ? 'edit' : 'confirmed',
            attendant: result.data.attendant,
            errorMessage: '',
            wasUpdated: false,
         });
      };

      void initialize();

      return () => {
         cancelled = true;
      };
   }, [initialAction, initialToken, reset, resolveErrorMessage, setState, translate, translateRoot]);

   const handleSwitchToEdit = () => {
      if (!state.attendant) {
         return;
      }

      if (state.attendant.isEditExpired) {
         toast.error(translateRoot('services.game_lucky_draw.attendant.vip_edit_expired'));
         return;
      }

      reset(getInitialValues(state.attendant));
      setState({
         mode: 'edit',
         submitError: '',
      });
   };

   const handleCancelEdit = () => {
      if (!state.attendant) {
         return;
      }

      reset(getInitialValues(state.attendant));
      setState({
         mode: 'confirmed',
         submitError: '',
      });
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         setState({
            submitError: '',
         });

         const updateResult = await useServicesGameLuckyDrawVipAccommodationUpdate({
            token: initialToken,
            salutation: (values.salutation || null) as Types.Salutation | null,
            full_name: values.full_name,
            citizen_id: values.citizen_id || null,
            email: values.email || null,
            phone: values.phone || null,
         });

         if (updateResult.error) {
            const localizedError = resolveErrorMessage(updateResult.message);
            setState({
               submitError: localizedError,
            });
            toast.error(localizedError);
            return;
         }

         if (!updateResult.data) {
            const fallbackError = translate('error.fallback');
            setState({
               submitError: fallbackError,
            });
            toast.error(fallbackError);
            return;
         }

         toast.success(translate('toast.update_success'));
         reset(getInitialValues(updateResult.data.attendant));
         setState({
            mode: 'confirmed',
            attendant: updateResult.data.attendant,
            submitError: '',
            wasUpdated: true,
         });
      });
   });

   return {
      param: {
         initialAction,
         mode: state.mode,
         attendant: state.attendant,
         salutationOptions: SALUTATION_OPTIONS,
         errorMessage: state.errorMessage,
         submitError: state.submitError,
         wasUpdated: state.wasUpdated,
         isPending,
         canCancelEdit:
            initialAction !== 'edit' || Boolean(state.attendant?.accommodationConfirmed) || state.wasUpdated,
         isSubmitDisabled: isPending || !formState.isValid,
         errors: formState.errors,
      },
      func: {
         translate,
         register,
         onSubmit,
         handleSwitchToEdit,
         handleCancelEdit,
      },
   };
}
