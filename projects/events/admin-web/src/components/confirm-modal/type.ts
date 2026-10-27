export interface Properties {
   id: string;
   title: AdminWeb.ReactNode;
   description?: AdminWeb.ReactNode;
   message: AdminWeb.ReactNode;
   cancelLabel: string;
   confirmLabel: string;
   loadingLabel?: string;
   isLoading?: boolean;
   onConfirm: () => void | Promise<void>;
}

