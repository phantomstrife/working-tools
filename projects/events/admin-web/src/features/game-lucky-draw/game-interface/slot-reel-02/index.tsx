'use client';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const SlotReel02: AdminWeb.Component<Types.Properties> = (properties) => {
   const { variant = 'default', className, charClassName } = properties;
   const { param } = useLogic(properties);
   const { reelBox, charText } = useStyle;

   return (
      <div className={reelBox({ variant, className })}>
         <div className={charText({ variant, spinning: param.isSpinning, className: charClassName })}>
            {param.displayChar}
         </div>
      </div>
   );
};
