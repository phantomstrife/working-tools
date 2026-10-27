import { useEffect } from 'react';
import type { RefObject } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';

import { useStoreModal } from '../../stores/modal';
import { useLogic } from './use-logic';

import type * as Types from './type';

export function useController(properties: Types.Properties, contentRef: RefObject<HTMLDivElement | null>) {
   const { id, disabled = false } = properties;

   const [state, setState] = useDeepState<Types.State>({
      status: 'init',
      disabled,
   });

   const actions = useStoreModal((store) => store.actions);
   const logic = useLogic({
      state,
      properties,
      contentRef,
      setState,
   });

   useEffect(() => {
      actions.registerModal(id, {
         open: logic.func.open,
         close: logic.func.close,
      });

      return () => {
         actions.unregisterModal(id);
      };
   }, [id, actions, logic.func.open, logic.func.close]);

   useEffect(() => {
      if (disabled === state.disabled) {
         return;
      }

      setState(disabled, 'disabled');
   }, [disabled, state.disabled, setState]);

   return {
      state,
      func: logic.func,
   };
}
