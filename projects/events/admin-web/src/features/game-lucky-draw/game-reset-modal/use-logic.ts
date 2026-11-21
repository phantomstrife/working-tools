import { useTransition } from 'react';
import { toast } from 'sonner';

import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawGameReset } from '@admin-web/services/game-lucky-draw/game-reset';

import { GAME_RESET_MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { game, onSuccess } = properties;

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

   const handleToggleResetCheckIns = (checked: boolean) => {
      if (state.deleteAttendants) {
         return;
      }

      setState(checked, 'resetCheckIns');
   };

   const handleToggleDeleteAttendants = (checked: boolean) => {
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

      startTransition(async () => {
         const resetResult = await useServicesGameLuckyDrawGameReset({
            gameId: game.id,
            resetCheckIns: state.deleteAttendants ? false : state.resetCheckIns,
            deleteAttendants: state.deleteAttendants,
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
            state.deleteAttendants
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
         isPending,
      },
      func: {
         translate,
         handleToggleResetCheckIns,
         handleToggleDeleteAttendants,
         handleClose,
         handleSubmit,
      },
   };
}
