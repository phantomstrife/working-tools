import { SlotReel } from '@client-app/features/game-lucky-draw/game-interface/slot-reel';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LuckyDrawBoard: ClientApp.Component<object> = () => {
   const { param, func } = useLogic();
   const {
      stageWrapper,
      boardCanvas,
      winnersOverlay,
      winnersHeader,
      winnersHeaderLeft,
      winnersTitle,
      winnersSubtitle,
      winnersHeaderRight,
      winnersCountBadge,
      winnersCloseBtn,
      winnersBody,
      winnersEmpty,
      winnersList,
      winnerItem,
      winnerItemLeft,
      winnerIndex,
      winnerNameBlock,
      winnerNameText,
      winnerOrgText,
      winnerTicketBadge,
      infoWrapper,
      winnerBanner,
      congratsLabel,
      displayNameHeading,
      companySubLabel,
      reelContainer,
      prizeContainer,
      prizeImage,
      prizeTextBox,
      prizeTitle,
      prizeRemainingLabel,
   } = useStyle;

   return (
      <div className={stageWrapper()}>
         {param.showWinners && param.currentPrize && (
            <div className={winnersOverlay()}>
               <div className={winnersHeader()}>
                  <div className={winnersHeaderLeft()}>
                     <div className={winnersTitle()}>{func.translate('winners_title')}</div>
                     <div className={winnersSubtitle()}>{param.currentPrize.name}</div>
                  </div>
                  <div className={winnersHeaderRight()}>
                     <span className={winnersCountBadge()}>
                        {param.prizeWinners.length}/{param.currentPrize.totalQuantity}
                     </span>
                     <button
                        type="button"
                        onClick={func.handleCloseWinners}
                        title={func.translate('close_winners_shortcut')}
                        className={winnersCloseBtn()}
                     >
                        ×
                     </button>
                  </div>
               </div>

               <div className={winnersBody()}>
                  {param.prizeWinners.length === 0 ? (
                     <p className={winnersEmpty()}>{func.translate('no_winners')}</p>
                  ) : (
                     <ul className={winnersList()}>
                        {param.prizeWinners.map((w, idx) => (
                           <li
                              key={w.id}
                              className={winnerItem()}
                           >
                              <div className={winnerItemLeft()}>
                                 <span className={winnerIndex()}>#{idx + 1}</span>
                                 <div className={winnerNameBlock()}>
                                    <span className={winnerNameText()}>{w.name}</span>
                                    {w.companyName && <span className={winnerOrgText()}>{w.companyName}</span>}
                                 </div>
                              </div>
                              <span className={winnerTicketBadge()}>{w.ticketCode}</span>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         )}

         <div
            className={boardCanvas()}
            style={{ backgroundImage: `url(${param.backgroundImage})` }}
         >
            <div className={infoWrapper()}>
               <div className={winnerBanner()}>
                  {!param.isSpinning && param.winningParticipant && (
                     <span className={congratsLabel()}>{func.translate('congrats')}</span>
                  )}
                  <h2 className={displayNameHeading()}>{param.displayName}</h2>
                  {!param.isSpinning && param.winningParticipant?.companyName && (
                     <span className={companySubLabel()}>
                        {[param.winningParticipant.companyName, param.winningParticipant.department]
                           .filter(Boolean)
                           .join(' • ')}
                     </span>
                  )}
               </div>

               <div
                  className={reelContainer()}
                  style={{ backgroundImage: `url(${param.resultBar})` }}
               >
                  {param.winnerChars.map((char, index) => (
                     <SlotReel
                        key={index}
                        targetChar={char}
                        isSpinning={param.isSpinning && index >= param.stoppedReels}
                     />
                  ))}
               </div>

               {param.currentPrize && (
                  <div className={prizeContainer()}>
                     {param.currentPrize.imageUrl ? (
                        <img
                           src={param.currentPrize.imageUrl}
                           alt={param.currentPrize.name}
                           className={prizeImage({ exhausted: param.prizeDone && !param.isSpinning })}
                        />
                     ) : (
                        <div />
                     )}
                     <div className={prizeTextBox()}>
                        <h1 className={prizeTitle()}>{param.currentPrize.name}</h1>
                        <span className={prizeRemainingLabel()}>
                           {param.prizeDone
                              ? func.translate('all_awarded')
                              : func.translate('remaining_count', {
                                   remaining: param.remaining,
                                   total: param.currentPrize.totalQuantity,
                                })}
                        </span>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
