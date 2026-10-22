export interface UpsertStickyBarProps {
   title: string;
   subtitle: string;
   saveLabel: string;
   savingLabel?: string;
   cancelLabel?: string;
   backAriaLabel?: string;
   isDirty: boolean;
   isPending: boolean;
   onCancel: () => void;
}

