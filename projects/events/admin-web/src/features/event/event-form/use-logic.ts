import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useServicesEventCreate } from '@admin-web/services/event/create';

import { EVENT_STATUS_OPTIONS, schema, toSlug } from './constants';

import type * as Types from './type';

const toDateTimeLocal = (isoString?: string | null): string => {
   if (!isoString) {
      return '';
   }

   const date = new Date(isoString);
   if (Number.isNaN(date.getTime())) {
      return '';
   }

   const offsetMs = date.getTimezoneOffset() * 60_000;
   return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const getInitialValues = (event?: Types.EventWithGames | null): Types.FormValues => ({
   name: event?.name ?? '',
   slug: event?.slug ?? '',
   status: event?.status ?? 'UPCOMING',
   start_time: toDateTimeLocal(event?.start_time),
   end_time: toDateTimeLocal(event?.end_time),
   location_name: event?.location_name ?? '',
   location_address: event?.location_address ?? '',
   banner_url: event?.banner_url ?? '',
   description: event?.description ?? '',
});

export function useLogic(properties: Types.Properties) {
   const { companyId, event = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = event ? 'edit' : 'create';
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.event.event_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const { formState, register, handleSubmit, reset, setValue } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(event),
      mode: 'onChange',
   });

   useEffect(() => {
      reset(getInitialValues(event));
   }, [event, reset]);

   const handleNameChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
      if (mode === 'edit' || formState.dirtyFields.slug) {
         return;
      }

      setValue('slug', toSlug(inputEvent.target.value), {
         shouldValidate: true,
         shouldDirty: false,
      });
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesEventCreate({
            id: event?.id,
            companyId,
            name: values.name,
            slug: values.slug,
            status: values.status,
            start_time: values.start_time || null,
            end_time: values.end_time || null,
            location_name: values.location_name || null,
            location_address: values.location_address || null,
            banner_url: values.banner_url || null,
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
         reset(getInitialValues(saveResult.data.event));
         onSuccess?.(saveResult.data.event);
      });
   });

   return {
      param: {
         mode,
         isPending,
         isSubmitDisabled: isPending || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
         statusOptions: EVENT_STATUS_OPTIONS,
      },
      func: {
         translate,
         register,
         handleNameChange,
         onSubmit,
         onCancel,
      },
   };
}
