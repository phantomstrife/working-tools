import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useServicesGameCreate } from '@admin-web/services/game/create';

import { GAME_STATUS_OPTIONS, GAME_TYPE_OPTIONS, schema } from './constants';

import type * as Types from './type';

const getInitialValues = (game?: Types.Game | null, defaultEventId?: string): Types.FormValues => ({
   event_id: game?.event_id ?? defaultEventId ?? '',
   name: game?.name ?? '',
   game_type: game?.game_type ?? 'LUCKY_DRAW',
   status: game?.status ?? 'READY',
   description: game?.description ?? '',
});

export function useLogic(properties: Types.Properties) {
   const { events, defaultEventId, game = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = game ? 'edit' : 'create';
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.event.game_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const { formState, register, handleSubmit, reset } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(game, defaultEventId || events[0]?.id),
      mode: 'onChange',
   });

   useEffect(() => {
      reset(getInitialValues(game, defaultEventId || events[0]?.id));
   }, [defaultEventId, events, game, reset]);

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameCreate({
            id: game?.id,
            eventId: values.event_id,
            name: values.name,
            game_type: values.game_type,
            status: values.status,
            description: values.description || null,
         });

         if (saveResult.error) {
            const localizedError = saveResult.message.startsWith('services.')
               ? translateRoot(saveResult.message)
               : saveResult.message;

            toast.error(localizedError);
            return;
         }

         toast.success(translate(`toast.${mode}_success`));
         reset(getInitialValues(saveResult.data.game, defaultEventId || events[0]?.id));
         onSuccess?.(saveResult.data.game);
      });
   });

   return {
      param: {
         mode,
         events,
         isPending,
         isSubmitDisabled: isPending || events.length === 0 || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
         gameTypeOptions: GAME_TYPE_OPTIONS,
         statusOptions: GAME_STATUS_OPTIONS,
      },
      func: {
         translate,
         register,
         onSubmit,
         onCancel,
      },
   };
}
