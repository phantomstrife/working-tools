import type { ChangeEvent } from 'react';

export interface SearchPageHeaderProps {
   title: string;
   subtitle: string;
   createLabel: string;
   csvInputId: string;
   isMutating?: boolean;
   isExportDisabled?: boolean;
   onImportCsvChange: (event: ChangeEvent<HTMLInputElement>) => void;
   onTriggerImportCsv: () => void;
   onExportCsv: () => void;
   onCreate: () => void;
}

