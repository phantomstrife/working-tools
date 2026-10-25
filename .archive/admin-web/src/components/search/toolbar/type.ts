export interface ToolbarSelectOption {
   label: string;
   value: string;
}

export interface ToolbarFilterSelect {
   key: string;
   ariaLabel: string;
   value: string;
   options: ReadonlyArray<ToolbarSelectOption>;
   onChange: (value: string) => void;
}

export interface ToolbarActiveChip {
   key: string;
   label: string;
   onRemove: () => void;
}

export interface SearchToolbarProps {
   searchValue: string;
   searchPlaceholder?: string;
   onSearchChange: (value: string) => void;
   onClearSearch: () => void;
   filters?: ReadonlyArray<ToolbarFilterSelect>;
   sortBy: string;
   sortOptions: ReadonlyArray<ToolbarSelectOption>;
   sortOrder: 'asc' | 'desc';
   onSortFieldChange: (field: string) => void;
   onToggleSortOrder: () => void;
   activeChips?: ReadonlyArray<ToolbarActiveChip>;
   onClearAllFilters?: () => void;
}

