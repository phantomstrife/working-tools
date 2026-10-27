'use client';

import { Download, FileSpreadsheet, UploadCloud } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const AttendantImport: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, param, func } = useLogic(properties);
   const { root, content, guide, dropzone, file_bar, preview, summary, footer } = useStyle;

   return (
      <div className={root}>
         <div className={content}>
            <div className={guide.wrapper}>
               <p className={guide.text}>
                  {func.translate('guide_prefix')} <span className={guide.code}>full_name</span>,{' '}
                  <span className={guide.code}>ticket_code</span> ({func.translate('guide_optional')}:{' '}
                  <span className={guide.code}>email, phone, company_name, department</span>)
               </p>
               <button
                  type="button"
                  onClick={func.handleDownloadTemplate}
                  className={guide.template_button}
               >
                  <Download className={guide.icon} />
                  {func.translate('actions.download_template')}
               </button>
            </div>

            {!state.fileName ? (
               <label
                  htmlFor="attendant-csv-file-input"
                  className={dropzone.wrapper({ isDragOver: state.isDragOver })}
                  onDragOver={func.handleDragOver}
                  onDragLeave={func.handleDragLeave}
                  onDrop={func.handleDrop}
               >
                  <input
                     id="attendant-csv-file-input"
                     type="file"
                     accept=".csv,text/csv"
                     className={dropzone.hidden_input}
                     onChange={func.handleFileChange}
                  />
                  <UploadCloud className={dropzone.icon} />
                  <span className={dropzone.title}>{func.translate('dropzone.title')}</span>
                  <span className={dropzone.subtitle}>{func.translate('dropzone.subtitle')}</span>
               </label>
            ) : (
               <div className={file_bar.wrapper}>
                  <div className={file_bar.info}>
                     <FileSpreadsheet className={file_bar.icon} />
                     <span className={file_bar.name}>{state.fileName}</span>
                     <span className={file_bar.count}>
                        ({func.translate('file.rows_detected', { count: state.totalRows })})
                     </span>
                  </div>
                  <button
                     type="button"
                     disabled={param.isPending}
                     onClick={func.handleClearFile}
                     className={file_bar.remove_button}
                  >
                     {func.translate('actions.change_file')}
                  </button>
               </div>
            )}

            {state.previewRows.length > 0 && (
               <div className={preview.wrapper}>
                  <span className={preview.title}>
                     {func.translate('preview.title', { count: state.previewRows.length })}
                  </span>
                  <div className={preview.scroll}>
                     <table className={preview.table}>
                        <thead>
                           <tr>
                              {state.headers.map((header) => (
                                 <th
                                    key={`csv-preview-header-${header}`}
                                    className={preview.th}
                                 >
                                    {header}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {state.previewRows.map((row, rowIndex) => (
                              <tr key={`csv-preview-row-${rowIndex}`}>
                                 {state.headers.map((header) => (
                                    <td
                                       key={`csv-preview-cell-${rowIndex}-${header}`}
                                       className={preview.td}
                                    >
                                       {row[header] || '—'}
                                    </td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {state.summary && state.summary.skippedCount > 0 && (
               <div className={summary.wrapper}>
                  <span className={summary.stats}>
                     {func.translate('summary.result', {
                        inserted: state.summary.insertedCount,
                        updated: state.summary.updatedCount,
                        skipped: state.summary.skippedCount,
                     })}
                  </span>
                  <div className={summary.error_list}>
                     {state.summary.errors.map((err, idx) => (
                        <span key={`csv-import-err-${idx}`}>
                           • {func.translate('summary.row_prefix', { row: err.row })}
                           {err.ticket_code ? ` (${err.ticket_code})` : ''}:{' '}
                           {func.translate(`summary.reasons.${err.reason}`)}
                        </span>
                     ))}
                  </div>
               </div>
            )}
         </div>

         <div className={footer.wrapper}>
            {func.onCancel && (
               <button
                  type="button"
                  disabled={param.isPending}
                  className={footer.cancel_button}
                  onClick={func.onCancel}
               >
                  {func.translate('actions.close')}
               </button>
            )}
            <button
               type="button"
               disabled={param.isImportDisabled}
               className={footer.submit_button({ disabled: param.isImportDisabled })}
               onClick={func.handleImport}
            >
               {func.translate(`actions.importing_${param.isPending}`)}
            </button>
         </div>
      </div>
   );
};
