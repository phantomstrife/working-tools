export interface BulkActionItem {
   key: string;
   label: string;
   onClick: () => void;
   disabled?: boolean;
}

export interface SearchBulkBarProps {
   selectedCount: number;
   isMutating?: boolean;
   actions?: ReadonlyArray<BulkActionItem>;
   onClearSelection: () => void;
   onExportSelected?: () => void;
   onDeleteSelected?: () => void;
}

