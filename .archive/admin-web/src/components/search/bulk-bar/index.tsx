import { Download, Trash2 } from 'lucide-react';

import { useStyle } from './use-style';

import type { SearchBulkBarProps } from './type';

export function SearchBulkBar({
   selectedCount,
   isMutating = false,
   actions = [],
   onClearSelection,
   onExportSelected,
   onDeleteSelected,
}: SearchBulkBarProps) {
   const { wrapper, leftGroup, countText, clearBtn, actions: actionsCls, actionBtn, dangerBtn, iconXs } = useStyle;

   if (selectedCount <= 0) {
      return null;
   }

   return (
      <div className={wrapper()}>
         <div className={leftGroup()}>
            <span className={countText()}>{selectedCount} selected</span>
            <button
               type="button"
               onClick={onClearSelection}
               className={clearBtn()}
            >
               Clear selection
            </button>
         </div>

         <div className={actionsCls()}>
            {actions.map((item) => (
               <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  disabled={Boolean(isMutating || item.disabled)}
                  className={actionBtn({ disabled: Boolean(isMutating || item.disabled) })}
               >
                  {item.label}
               </button>
            ))}

            {onExportSelected && (
               <button
                  type="button"
                  onClick={onExportSelected}
                  className={actionBtn()}
               >
                  <Download className={iconXs()} />
                  Export Selected
               </button>
            )}

            {onDeleteSelected && (
               <button
                  type="button"
                  onClick={onDeleteSelected}
                  disabled={isMutating}
                  className={dangerBtn({ disabled: isMutating })}
               >
                  <Trash2 className={iconXs()} />
                  Delete Selected
               </button>
            )}
         </div>
      </div>
   );
}

