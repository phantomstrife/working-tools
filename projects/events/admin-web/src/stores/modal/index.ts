import { create } from 'zustand';

import { registerModal, unregisterModal } from './use-dispatch';

import type * as Types from './type';

export const useStoreModal = create<Types.Store>()((set, get) => ({
   state: {
      modals: {},
   },

   actions: {
      registerModal: (id, modal) => {
         return set((store) => ({
            state: registerModal(store.state, id, modal),
         }));
      },
      unregisterModal: (id) => {
         return set((store) => ({
            state: unregisterModal(store.state, id),
         }));
      },
      openModal: (id, event) => {
         get().state.modals[id]?.open(event);
      },
      closeModal: (id) => {
         get().state.modals[id]?.close();
      },
   },
}));
