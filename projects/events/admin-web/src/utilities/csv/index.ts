import type * as Types from './type';

const stripBom = (input: string): string => {
   return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
};

const parseRawCsvMatrix = (input: string): string[][] => {
   const text = stripBom(input);
   const rows: string[][] = [];
   let currentRow: string[] = [];
   let currentCell = '';
   let inQuotes = false;

   for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const nextChar = text[index + 1];

      if (inQuotes) {
         if (char === '"' && nextChar === '"') {
            currentCell += '"';
            index += 1;
         } else if (char === '"') {
            inQuotes = false;
         } else {
            currentCell += char;
         }
         continue;
      }

      if (char === '"') {
         inQuotes = true;
      } else if (char === ',') {
         currentRow.push(currentCell.trim());
         currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
         currentRow.push(currentCell.trim());
         rows.push(currentRow);
         currentRow = [];
         currentCell = '';
         index += 1;
      } else if (char === '\n' || char === '\r') {
         currentRow.push(currentCell.trim());
         rows.push(currentRow);
         currentRow = [];
         currentCell = '';
      } else {
         currentCell += char;
      }
   }

   if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
   }

   return rows.filter((row) => row.some((cell) => cell !== ''));
};

export const parseCsv: Types.Parse_Csv = (content) => {
   const matrix = parseRawCsvMatrix(content);

   if (matrix.length === 0) {
      return {
         headers: [],
         rows: [],
      };
   }

   const rawHeaders = matrix[0];
   const headers = rawHeaders.map((header) => header.trim());

   const rows: Types.Parsed_Csv_Row[] = matrix.slice(1).map((cells) => {
      const record: Types.Parsed_Csv_Row = {};

      headers.forEach((header, columnIndex) => {
         if (!header) {
            return;
         }

         record[header] = cells[columnIndex] ?? '';
      });

      return record;
   });

   return {
      headers: headers.filter(Boolean),
      rows,
   };
};

export const escapeCsvCell: Types.Escape_Csv_Cell = (value) => {
   if (value === null || value === undefined) {
      return '';
   }

   const str = String(value);

   if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
   }

   return str;
};

export const stringifyCsv: Types.Stringify_Csv = (rows, columns) => {
   const headerLine = columns.map((column) => escapeCsvCell(column.header)).join(',');
   const dataLines = rows.map((row) => columns.map((column) => escapeCsvCell(column.getValue(row))).join(','));

   return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
};

export const downloadCsvFile: Types.Download_Csv_File = (csvContent, fileName) => {
   if (typeof window === 'undefined') {
      return;
   }

   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');

   link.href = url;
   link.setAttribute('download', fileName);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
};

