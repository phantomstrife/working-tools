'use client';

import { SearchX } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const NotFound: AdminWeb.Component<Types.Properties> = (properties) => {
   const { title, description, actionLabel, onAction } = properties;

   const { func } = useLogic();
   const { root, icon, content, action } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={icon.wrapper}>
            <SearchX className={icon.svg} />
         </div>
         <h3 className={content.title}>{title || func.translate('default_title')}</h3>
         <p className={content.description}>{description || func.translate('default_description')}</p>
         {actionLabel && onAction && (
            <button
               className={action.button}
               onClick={onAction}
            >
               {actionLabel}
            </button>
         )}
      </div>
   );
};
