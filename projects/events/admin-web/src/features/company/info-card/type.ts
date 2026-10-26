import type { LucideIcon } from 'lucide-react';

export interface Properties {
   company: Database.Company;
}

export type Tone = 'primary' | 'info' | 'success' | 'warning';

export interface Contact {
   Icon: LucideIcon;
   label: string;
   value: string | null;
   tone: Tone;
   copyable?: boolean;
}
