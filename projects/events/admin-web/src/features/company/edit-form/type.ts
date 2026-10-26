export interface Properties {
   className?: string;
   company: Company;
   onUpdate?: (company: Company) => void;
}

export interface State {
   isModalOpen: boolean;
}

export type Company = AdminWeb.Database.Company;
export type ToggleModal = (isOpen: boolean) => void;
