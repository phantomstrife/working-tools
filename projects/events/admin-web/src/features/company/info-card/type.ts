import type { LucideIcon } from 'lucide-react';

export interface Properties {
   company: Company;
}

export interface State {
   company: Company;
}

export type Company = AdminWeb.Database.Company;

export interface Contact {
   Icon: LucideIcon;
   label: string;
   value: string | null;
   tone: 'primary' | 'info' | 'success' | 'warning';
   copyable?: boolean;
}
