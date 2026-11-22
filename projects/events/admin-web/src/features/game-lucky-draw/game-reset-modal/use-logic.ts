import { useTransition } from 'react';
import { toast } from 'sonner';

import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawGameReset } from '@admin-web/services/game-lucky-draw/game-reset';

import { GAME_RESET_MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { game, role, onSuccess } = properties;
   const isSuperAdmin = role === 'SUPER_ADMIN';

   const modalActions = useStoreModal((store) => store.actions);
   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.game_reset',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState, , resetState] = useDeepState<Types.State>({
      resetCheckIns: false,
      deleteAttendants: false,
   });

   const isGameDataOnly = !isSuperAdmin || (!state.resetCheckIns && !state.deleteAttendants);

   const handleSelectGameDataOnly = () => {
      setState({
         resetCheckIns: false,
         deleteAttendants: false,
      });
   };

   const handleToggleResetCheckIns = (checked: boolean) => {
      if (!isSuperAdmin || state.deleteAttendants) {
         return;
      }

      setState(checked, 'resetCheckIns');
   };

   const handleToggleDeleteAttendants = (checked: boolean) => {
      if (!isSuperAdmin) {
         return;
      }

      setState({
         deleteAttendants: checked,
         ...(checked ? { resetCheckIns: false } : {}),
      });
   };

   const handleClose = () => {
      if (isPending) {
         return;
      }

      resetState();
      modalActions.closeModal(GAME_RESET_MODAL_ID);
   };

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isPending || !game.id) {
         return;
      }

      const effectiveDeleteAttendants = isSuperAdmin && state.deleteAttendants;
      const effectiveResetCheckIns = isSuperAdmin && !effectiveDeleteAttendants && state.resetCheckIns;
      const mode = !effectiveResetCheckIns && !effectiveDeleteAttendants ? 'GAME_DATA_ONLY' : 'CUSTOM';

      startTransition(async () => {
         const resetResult = await useServicesGameLuckyDrawGameReset({
            gameId: game.id,
            mode,
            resetCheckIns: effectiveResetCheckIns,
            deleteAttendants: effectiveDeleteAttendants,
         });

         if (resetResult.error) {
            const localizedError = resetResult.message.startsWith('services.')
               ? translateRoot(resetResult.message)
               : resetResult.message;

            toast.error(localizedError);
            return;
         }

         const { deletedWinners, resetPrizes, resetAttendants, deletedAttendants } = resetResult.data;

         toast.success(
            effectiveDeleteAttendants
               ? translate('toast.success_deleted', {
                    winners: deletedWinners,
                    prizes: resetPrizes,
                    attendants: deletedAttendants,
                 })
               : translate('toast.success_reset', {
                    winners: deletedWinners,
                    prizes: resetPrizes,
                    attendants: resetAttendants,
                 }),
         );

         resetState();
         modalActions.closeModal(GAME_RESET_MODAL_ID);
         await onSuccess?.();
      });
   };

   return {
      state,
      param: {
         game,
         isSuperAdmin,
         isGameDataOnly,
         isPending,
      },
      func: {
         translate,
         handleSelectGameDataOnly,
         handleToggleResetCheckIns,
         handleToggleDeleteAttendants,
         handleClose,
         handleSubmit,
      },
   };
}
