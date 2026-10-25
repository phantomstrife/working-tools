import { Download, Plus, Upload } from 'lucide-react';

import { useStyle } from './use-style';

import type { SearchPageHeaderProps } from './type';

export function SearchPageHeader({
   title,
   subtitle,
   createLabel,
   csvInputId,
   isMutating = false,
   isExportDisabled = false,
   onImportCsvChange,
   onTriggerImportCsv,
   onExportCsv,
   onCreate,
}: SearchPageHeaderProps) {
   const { wrapper, titleGroup, title: titleCls, subtitle: subtitleCls, actions, hiddenInput, secondaryBtn, primaryBtn, icon } = useStyle;

   return (
      <header className={wrapper()}>
         <div className={titleGroup()}>
            <h1 className={titleCls()}>{title}</h1>
            <span className={subtitleCls()}>{subtitle}</span>
         </div>

         <div className={actions()}>
            <input
               id={csvInputId}
               type="file"
               accept=".csv"
               className={hiddenInput()}
               onChange={onImportCsvChange}
            />
            <button
               type="button"
               onClick={onTriggerImportCsv}
               disabled={isMutating}
               className={secondaryBtn({ disabled: isMutating })}
            >
               <Upload className={icon()} />
               Import CSV
            </button>
            <button
               type="button"
               onClick={onExportCsv}
               disabled={isExportDisabled}
               className={secondaryBtn({ disabled: isExportDisabled })}
            >
               <Download className={icon()} />
               Export CSV
            </button>
            <button
               type="button"
               onClick={onCreate}
               className={primaryBtn()}
            >
               <Plus className={icon()} />
               {createLabel}
            </button>
         </div>
      </header>
   );
}

