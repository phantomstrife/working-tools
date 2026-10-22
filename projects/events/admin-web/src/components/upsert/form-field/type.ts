import type { ReactNode } from 'react';

export interface FormFieldProps {
   id: string;
   label: string;
   required?: boolean;
   fullSpan?: boolean;
   hint?: string;
   error?: string;
   children: ReactNode;
}

