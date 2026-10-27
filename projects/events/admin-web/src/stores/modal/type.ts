export interface Store {
   state: State;
   actions: Actions;
}

export interface State {
   modals: Record<string, AdminWeb.Store.Modal.Functions>;
}

export interface Actions {
   registerModal: (id: string, modal: AdminWeb.Store.Modal.Functions) => void;
   unregisterModal: (id: string) => void;
   openModal: (id: string, event?: React.MouseEvent | MouseEvent) => void;
   closeModal: (id: string) => void;
}

export type Register_Modal = (
   state: State,
   id: string,
   modal: AdminWeb.Store.Modal.Functions,
) => State;

export type Unregister_Modal = (state: State, id: string) => State;

