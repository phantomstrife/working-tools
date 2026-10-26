'use client';

import { SearchX } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const NotFound: AdminWeb.Component<Types.Properties> = (properties) => {
   const { error, retryLabel, onRetry } = properties;

   const { func } = useLogic();
   const { root, info, action } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={info.icon}>
            <SearchX size={32} />
         </div>
         <h3 className={info.error}>{func.translate(error)}</h3>
         <span className={info.description}>{func.translate('components.not_found.description')}</span>

         <button
            className={action.button}
            onClick={onRetry}
         >
            {retryLabel || func.translate('components.not_found.retry')}
         </button>
      </div>
   );
};
