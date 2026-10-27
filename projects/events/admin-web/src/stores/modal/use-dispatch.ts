import type * as Types from './type';

export const registerModal: Types.Register_Modal = (state, id, modal) => {
   const modals = {
      ...state.modals,
      [id]: modal,
   };

   return {
      ...state,
      modals,
   };
};

export const unregisterModal: Types.Unregister_Modal = (state, id) => {
   const modals = { ...state.modals };
   delete modals[id];

   return {
      ...state,
      modals,
   };
};

