import type { LucideIcon } from 'lucide-react';

export interface Properties {
   className?: string;
   Icon: LucideIcon;
   label: string;
   value: string;
   copyable?: boolean;
}
