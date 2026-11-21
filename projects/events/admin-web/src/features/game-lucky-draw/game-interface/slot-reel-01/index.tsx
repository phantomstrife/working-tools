'use client';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const SlotReel01: AdminWeb.Component<Types.Properties> = (properties) => {
   const { variant = 'default', className, charClassName } = properties;
   const { param } = useLogic(properties);
   const {
      reelBox,
      charText,
      splitFlapColumn,
      splitFlapFrame,
      splitFlapCavity,
      splitFlapUpperHalf,
      splitFlapLowerHalf,
      splitFlapStripViewport,
      splitFlapStrip,
      splitFlapStripItem,
      splitFlapStripGlyph,
      splitFlapCharStage,
      splitFlapChar,
      splitFlapVignette,
      splitFlapSeam,
      splitFlapPin,
      splitFlapStatusBar,
   } = useStyle;

   if (param.isSplitFlap) {
      return (
         <div
            className={splitFlapColumn({ className })}
            style={param.columnStyle}
         >
            <div className={splitFlapFrame({ state: param.columnState })}>
               <div
                  className={splitFlapCavity({
                     victory: param.isVictory,
                     victoryRevealed: param.isVictoryRevealed,
                  })}
               >
                  <span
                     aria-hidden="true"
                     className={splitFlapUpperHalf()}
                  />
                  <span
                     aria-hidden="true"
                     className={splitFlapLowerHalf()}
                  />

                  {param.isSpinning ? (
                     <div className={splitFlapStripViewport()}>
                        <div className={splitFlapStrip()}>
                           {param.rollStrip.map((stripChar, stripIndex) => (
                              <span
                                 key={stripIndex}
                                 className={splitFlapStripItem()}
                              >
                                 <span className={splitFlapStripGlyph()}>{stripChar}</span>
                              </span>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className={splitFlapCharStage({ state: param.columnState })}>
                        <span className={splitFlapChar({ state: param.columnState, className: charClassName })}>
                           {param.displayChar}
                        </span>
                     </div>
                  )}

                  <span
                     aria-hidden="true"
                     className={splitFlapVignette()}
                  />
                  <span
                     aria-hidden="true"
                     className={splitFlapSeam()}
                  />
                  <span
                     aria-hidden="true"
                     className={splitFlapPin({ side: 'left' })}
                  />
                  <span
                     aria-hidden="true"
                     className={splitFlapPin({ side: 'right' })}
                  />
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className={reelBox({ variant, className })}>
         <div className={charText({ variant, spinning: param.isSpinning, className: charClassName })}>
            {param.displayChar}
         </div>
      </div>
   );
};
