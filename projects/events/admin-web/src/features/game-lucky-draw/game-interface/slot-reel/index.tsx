'use client';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const SlotReel: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param } = useLogic(properties);
   const { reelBox, charText } = useStyle;

   return (
      <div className={reelBox()}>
         <div className={charText({ spinning: param.isSpinning })}>{param.displayChar}</div>
      </div>
   );
};

