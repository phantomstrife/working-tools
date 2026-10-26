import z from 'zod';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import { useServicesCompanyUpdate } from '@admin-web/services/company/update';

import { schema } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { company, onUpdate } = properties;

   const [isPending, startTransition] = useTransition();

   const [state, setState] = useDeepState<Types.State>({
      isModalOpen: false,
   });

   const { translate } = useTranslate({
      prefix: 'features.company.edit_form',
   });

   const { formState, register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: company,
      mode: 'onChange',
   });

   const toggleModal: Types.ToggleModal = (isOpen) => {
      if (isOpen) {
         reset(company);
      }

      setState(isOpen, 'isModalOpen');
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const serviceCompanyUpdate = await useServicesCompanyUpdate({
            id: company.id,
            name: values.name,
            tax_code: values.tax_code || null,
            industry: values.industry || null,
            contact_person: values.contact_person || null,
            contact_email: values.contact_email || null,
            contact_phone: values.contact_phone || null,
            address: values.address || null,
            logo_url: values.logo_url || null,
            status: company.status,
         });

         if (serviceCompanyUpdate.error) {
            toast.error(serviceCompanyUpdate.message);
            return;
         }

         toast.success(translate('toast.update_success'));

         reset(serviceCompanyUpdate.data.company);
         onUpdate?.(serviceCompanyUpdate.data.company);
         setState(false, 'isModalOpen');
      });
   });

   return {
      state,
      param: {
         company,
         isPending,
         isDisabled: formState.isDirty && isPending,
         errors: formState.errors,
      },
      func: {
         translate,
         toggleModal,
         register,
         onSubmit,
      },
   };
}
