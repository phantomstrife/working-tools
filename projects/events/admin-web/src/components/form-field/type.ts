export interface Properties {
   id: string;
   className?: string;
   label: string;
   hint?: string;
   error?: string;
   required?: boolean;
   children: ReactNode;
}
