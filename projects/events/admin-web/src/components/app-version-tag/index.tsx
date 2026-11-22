'use client';

import { RefreshCw } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const AppVersionTag: AdminWeb.Component<object> = () => {
   const { state, param, func } = useLogic();
   const { button, icon } = useStyle;

   if (param.isHidden) {
      return null;
   }

   return (
      <button
         type="button"
         onClick={func.handleClick}
         title={param.tooltip}
         aria-label={param.tooltip}
         className={button({ mismatch: param.hasMismatch })}
      >
         {(param.hasMismatch || state.isChecking) && (
            <RefreshCw
               size={11}
               className={icon({ spinning: state.isChecking })}
            />
         )}
         <span>{param.displayText}</span>
      </button>
   );
};
