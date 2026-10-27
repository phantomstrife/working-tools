'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { useStyle } from './use-style';

import type * as Types from './type';

export const RowActions: AdminWeb.Component<Types.Properties> = (properties) => {
   const { editLabel = 'Edit', deleteLabel = 'Delete', onEdit, onDelete } = properties;
   const { wrapper, button, icon } = useStyle;

   return (
      <div className={wrapper}>
         {onEdit && (
            <button
               type="button"
               aria-label={editLabel}
               className={button({ danger: false })}
               onClick={onEdit}
            >
               <Pencil className={icon} />
            </button>
         )}
         {onDelete && (
            <button
               type="button"
               aria-label={deleteLabel}
               className={button({ danger: true })}
               onClick={onDelete}
            >
               <Trash2 className={icon} />
            </button>
         )}
      </div>
   );
};

