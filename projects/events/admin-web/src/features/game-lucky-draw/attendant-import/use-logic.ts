import { useTransition } from 'react';
import { toast } from 'sonner';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawAttendantImportCsv } from '@admin-web/services/game-lucky-draw/attendant-import-csv';
import { downloadCsvFile, parseCsv, stringifyCsv } from '@admin-web/utilities/csv';

import { PREVIEW_LIMIT, SAMPLE_CSV_ROWS } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { gameId, onSuccess, onCancel } = properties;

   const [isPending, startTransition] = useTransition();

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.attendant_import',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState, , resetState] = useDeepState<Types.State>({
      fileName: '',
      csvContent: '',
      headers: [],
      previewRows: [],
      totalRows: 0,
      isDragOver: false,
      summary: null,
   });

   const processFile = async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
         toast.error(translate('toast.invalid_file_type'));
         return;
      }

      const content = await file.text();
      const parsed = parseCsv(content);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
         toast.error(translate('toast.empty_file'));
         return;
      }

      setState({
         fileName: file.name,
         csvContent: content,
         headers: parsed.headers,
         previewRows: parsed.rows.slice(0, PREVIEW_LIMIT),
         totalRows: parsed.rows.length,
         isDragOver: false,
         summary: null,
      });
   };

   const handleFileChange: Types.HandleFileChange = (event) => {
      const file = event.target.files?.[0];

      if (file) {
         void processFile(file);
      }

      event.target.value = '';
   };

   const handleDragOver: Types.HandleDragEvent = (event) => {
      event.preventDefault();
      setState(true, 'isDragOver');
   };

   const handleDragLeave: Types.HandleDragEvent = (event) => {
      event.preventDefault();
      setState(false, 'isDragOver');
   };

   const handleDrop: Types.HandleDragEvent = (event) => {
      event.preventDefault();
      setState(false, 'isDragOver');

      const file = event.dataTransfer.files?.[0];
      if (file) {
         void processFile(file);
      }
   };

   const handleDownloadTemplate = () => {
      const sampleCsv = stringifyCsv(SAMPLE_CSV_ROWS, [
         { header: 'full_name', getValue: (row) => row.full_name },
         { header: 'ticket_code', getValue: (row) => row.ticket_code },
         { header: 'email', getValue: (row) => row.email },
         { header: 'phone', getValue: (row) => row.phone },
         { header: 'company_name', getValue: (row) => row.company_name },
         { header: 'department', getValue: (row) => row.department },
      ]);

      downloadCsvFile(sampleCsv, 'lucky-draw-attendants-template.csv');
   };

   const handleClearFile = () => {
      resetState();
   };

   const handleImport = () => {
      if (!state.csvContent || isPending) {
         return;
      }

      startTransition(async () => {
         const importResult = await useServicesGameLuckyDrawAttendantImportCsv({
            gameId,
            csvContent: state.csvContent,
         });

         if (importResult.error) {
            const localizedError = importResult.message.startsWith('services.')
               ? translateRoot(importResult.message)
               : importResult.message;

            toast.error(localizedError);
            return;
         }

         const summary = importResult.data;
         setState({ summary });

         toast.success(
            translate('toast.import_success', {
               inserted: summary.insertedCount,
               updated: summary.updatedCount,
            }),
         );

         onSuccess?.(summary);

         if (summary.skippedCount === 0) {
            resetState();
            onCancel?.();
         }
      });
   };

   const handleClose = () => {
      resetState();
      onCancel?.();
   };

   return {
      state,
      param: {
         isPending,
         isImportDisabled: isPending || !state.csvContent || state.totalRows === 0,
      },
      func: {
         translate,
         handleFileChange,
         handleDragOver,
         handleDragLeave,
         handleDrop,
         handleDownloadTemplate,
         handleClearFile,
         handleImport,
         onCancel: handleClose,
      },
   };
}

