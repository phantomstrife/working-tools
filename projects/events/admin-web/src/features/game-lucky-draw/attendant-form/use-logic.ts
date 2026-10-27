import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawAttendantSave } from '@admin-web/services/game-lucky-draw/attendant-save';

import { schema } from './constants';

import type * as Types from './type';

const getInitialValues = (attendant?: Types.Attendant | null): Types.FormValues => ({
   full_name: attendant?.full_name ?? '',
   ticket_code: attendant?.ticket_code ?? '',
   email: attendant?.email ?? '',
   phone: attendant?.phone ?? '',
   company_name: attendant?.company_name ?? '',
   department: attendant?.department ?? '',
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

   const { formState, register, handleSubmit, reset } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(attendant),
      mode: 'onChange',
   });

   useEffect(() => {
      reset(getInitialValues(attendant));
   }, [attendant, reset]);

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameLuckyDrawAttendantSave({
            id: attendant?.id,
            gameId,
            full_name: values.full_name,
            ticket_code: values.ticket_code,
            email: values.email || null,
            phone: values.phone || null,
            company_name: values.company_name || null,
            department: values.department || null,
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
         isPending,
         isSubmitDisabled: isPending || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
      },
      func: {
         translate,
         register,
         onSubmit,
         onCancel,
      },
   };
}

