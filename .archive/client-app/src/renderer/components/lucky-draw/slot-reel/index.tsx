import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { SlotReelProps } from './use-logic';

export const SlotReel = (props: SlotReelProps) => {
   const { param } = useLogic(props);
   const { reelBox, charText } = useStyle;

   return (
      <div className={reelBox()}>
         <div className={charText({ spinning: param.isSpinning })}>{param.displayChar}</div>
      </div>
   );
};

