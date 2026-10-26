import { LucideIcon } from 'lucide-react';

export interface Properties {
   id: string;
   className?: string;
   Icon?: LucideIcon;
   label: string;
   hint?: string;
   required?: boolean;
   error?: string;
   children: AdminWeb.ReactNode;
}
