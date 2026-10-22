export interface ConfirmDeleteModalProps {
   isOpen: boolean;
   title: string;
   entityName: string;
   descriptionSuffix?: string;
   confirmLabel?: string;
   isPending?: boolean;
   onCancel: () => void;
   onConfirm: () => void;
}

