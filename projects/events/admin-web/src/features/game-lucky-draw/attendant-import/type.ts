import type * as ImportServiceTypes from '@admin-web/services/game-lucky-draw/attendant-import-csv/type';
import type * as CsvTypes from '@admin-web/utilities/csv/type';

export interface Properties {
   gameId: string;
   onSuccess?: (summary: ImportSummary) => void;
   onCancel?: () => void;
}

export interface State {
   fileName: string;
   csvContent: string;
   headers: string[];
   previewRows: CsvTypes.Parsed_Csv_Row[];
   totalRows: number;
   isDragOver: boolean;
   summary: ImportSummary | null;
}

export type ImportSummary = ImportServiceTypes.Response;
export type HandleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type HandleDragEvent = (event: React.DragEvent<HTMLLabelElement>) => void;

