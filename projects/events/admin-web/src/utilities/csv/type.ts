export type Parsed_Csv_Row = Record<string, string>;

export interface Parse_Csv_Result {
   headers: string[];
   rows: Parsed_Csv_Row[];
}

export interface Csv_Column<T> {
   header: string;
   getValue: (row: T) => string | number | boolean | null | undefined;
}

export type Parse_Csv = (content: string) => Parse_Csv_Result;
export type Escape_Csv_Cell = (value: string | number | boolean | null | undefined) => string;
export type Stringify_Csv = <T>(rows: T[], columns: Csv_Column<T>[]) => string;
export type Download_Csv_File = (csvContent: string, fileName: string) => void;

