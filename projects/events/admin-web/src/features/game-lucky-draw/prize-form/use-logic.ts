import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawPrizeSave } from '@admin-web/services/game-lucky-draw/prize-save';

import { schema } from './constants';

import type * as Types from './type';

const getInitialValues = (prize?: Types.Prize | null): Types.FormValues => ({
   name: prize?.name ?? '',
   tier_order: prize?.tier_order ?? 1,
   total_quantity: prize?.total_quantity ?? 1,
   remaining_quantity: prize?.remaining_quantity ?? 1,
   image_url: prize?.image_url ?? '',
   description: prize?.description ?? '',
});

export function useLogic(properties: Types.Properties) {
   const { gameId, prize = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = prize ? 'edit' : 'create';
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.prize_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const { formState, register, handleSubmit, reset, setValue } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(prize),
      mode: 'onChange',
   });

   useEffect(() => {
      reset(getInitialValues(prize));
   }, [prize, reset]);

   const handleTotalQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (mode !== 'create') {
         return;
      }

      const nextTotal = Number(event.target.value);
      if (!Number.isNaN(nextTotal) && nextTotal >= 0) {
         setValue('remaining_quantity', nextTotal, { shouldValidate: true });
      }
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameLuckyDrawPrizeSave({
            id: prize?.id,
            gameId,
            name: values.name,
            tier_order: values.tier_order,
            total_quantity: values.total_quantity,
            remaining_quantity: mode === 'create' ? values.total_quantity : values.remaining_quantity,
            image_url: values.image_url || null,
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
         reset(getInitialValues(saveResult.data.prize));
         onSuccess?.(saveResult.data.prize);
      });
   });

   return {
      param: {
         mode,
         isPending,
         isSubmitDisabled: isPending || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
      },
      func: {
         translate,
         register,
         handleTotalQuantityChange,
         onSubmit,
         onCancel,
      },
   };
}

