import { useCallback, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameStaffCandidates } from '@admin-web/services/game/staff-candidates';
import { useServicesGameStaffSave } from '@admin-web/services/game/staff-save';

import { assignSchema, editSchema } from './constants';

import type * as Types from './type';

const getInitialEditValues = (staff?: Types.StaffMember | null): Types.EditFormValues => ({
   full_name: staff?.full_name ?? '',
   phone: staff?.phone ?? '',
   role: staff?.role === 'GUARD' ? 'GUARD' : 'FIELD_STAFF',
   status: staff?.is_active === false ? 'INACTIVE' : 'ACTIVE',
});

export function useLogic(properties: Types.Properties) {
   const { gameId, staff = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = staff ? 'edit' : 'assign';
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.staff_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      candidates: [],
      isLoadingCandidates: false,
   });

   const assignForm = useForm<Types.AssignFormValues>({
      resolver: zodResolver(assignSchema),
      defaultValues: { accountId: '' },
      mode: 'onChange',
   });

   const editForm = useForm<Types.EditFormValues>({
      resolver: zodResolver(editSchema),
      defaultValues: getInitialEditValues(staff),
      mode: 'onChange',
   });

   const fetchCandidates = useCallback(async () => {
      if (!gameId || mode !== 'assign') {
         return;
      }

      setState({
         isLoadingCandidates: true,
      });

      const result = await useServicesGameStaffCandidates({ gameId });

      if (result.error) {
         setState({
            candidates: [],
            isLoadingCandidates: false,
         });
         return;
      }

      setState({
         candidates: result.data.candidates,
         isLoadingCandidates: false,
      });
   }, [gameId, mode, setState]);

   useEffect(() => {
      if (mode === 'assign') {
         assignForm.reset({ accountId: '' });
         void fetchCandidates();
      } else {
         editForm.reset(getInitialEditValues(staff));
      }
   }, [mode, staff, assignForm, editForm, fetchCandidates]);

   const onSubmitAssign = assignForm.handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameStaffSave({
            mode: 'assign',
            gameId,
            accountId: values.accountId,
         });

         if (saveResult.error) {
            const localizedError = saveResult.message.startsWith('services.')
               ? translateRoot(saveResult.message)
               : saveResult.message;

            toast.error(localizedError);
            return;
         }

         toast.success(translate('toast.assign_success'));
         assignForm.reset({ accountId: '' });
         void fetchCandidates();
         onSuccess?.();
      });
   });

   const onSubmitEdit = editForm.handleSubmit((values) => {
      if (!staff) {
         return;
      }

      startTransition(async () => {
         const saveResult = await useServicesGameStaffSave({
            mode: 'edit',
            gameId,
            assignmentId: staff.id,
            accountId: staff.accountId,
            full_name: values.full_name,
            phone: values.phone || null,
            role: values.role,
            is_active: values.status === 'ACTIVE',
         });

         if (saveResult.error) {
            const localizedError = saveResult.message.startsWith('services.')
               ? translateRoot(saveResult.message)
               : saveResult.message;

            toast.error(localizedError);
            return;
         }

         toast.success(translate('toast.edit_success'));
         onSuccess?.();
      });
   });

   const isSubmitDisabled =
      mode === 'assign'
         ? isPending || state.isLoadingCandidates || state.candidates.length === 0 || !assignForm.formState.isValid
         : isPending || !editForm.formState.isDirty;

   return {
      state,
      param: {
         mode,
         staff,
         isPending,
         isSubmitDisabled,
         assignErrors: assignForm.formState.errors,
         editErrors: editForm.formState.errors,
      },
      func: {
         translate,
         registerAssign: assignForm.register,
         registerEdit: editForm.register,
         onSubmit: mode === 'assign' ? onSubmitAssign : onSubmitEdit,
         onCancel,
      },
   };
}

