import { Check, Copy } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CopyButton: AdminWeb.Component<Types.Properties> = (properties) => {
   const { className, value } = properties;

   const { state, func } = useLogic();
   const { root } = useStyle;

   return (
      <button
         type="button"
         className={className}
         onClick={() => func.handleCopy(value)}
      >
         {state.executed ? <Check className={root.wrapper(state)} /> : <Copy className={root.wrapper(state)} />}
      </button>
   );
};
