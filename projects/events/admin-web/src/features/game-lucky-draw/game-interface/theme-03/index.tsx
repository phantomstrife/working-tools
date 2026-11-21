'use client';

import { Maximize2, Minimize2, Phone, X } from 'lucide-react';

import { SlotReel01 } from '@admin-web/features/game-lucky-draw/game-interface/slot-reel-01';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LuckyDrawBoardTheme03: AdminWeb.Component<object> = () => {
   const { stageRef, param, func } = useLogic();
   const {
      stageWrapper,
      stageCanvas,
      stageBg,
      fullscreenBtn,
      leftZone,
      prizeTitle,
      statusText,
      rightBox,
      reelLayer,
      reelRow,
      winnerOverlay,
      winnerCloseBtn,
      winnerCloseIcon,
      winnerTicketBadge,
      winnerCompany,
      winnerName,
      winnerPhonePill,
      winnerPhoneIcon,
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
      winnerPhoneText,
      winnerListTicketBadge,
   } = useStyle;

   return (
      <div
         ref={stageRef}
         className={stageWrapper()}
      >
         <button
            type="button"
            onClick={() => void func.handleToggleFullscreen()}
            title={
               param.isFullscreen
                  ? func.translate('exit_fullscreen_shortcut')
                  : func.translate('enter_fullscreen_shortcut')
            }
            className={fullscreenBtn()}
         >
            {param.isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
         </button>

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
                        {param.prizeWinners.map((winner, idx) => {
                           const resolvedName = func.resolveEffectiveAttendeeName(winner);
                           const resolvedPhone = func.resolveEffectiveAttendeePhone(winner);

                           return (
                              <li
                                 key={winner.id}
                                 className={winnerItem()}
                              >
                                 <div className={winnerItemLeft()}>
                                    <span className={winnerIndex()}>#{idx + 1}</span>
                                    <div className={winnerNameBlock()}>
                                       <span className={winnerNameText()}>{resolvedName}</span>
                                       {winner.companyName && (
                                          <span className={winnerOrgText()}>{winner.companyName}</span>
                                       )}
                                       {resolvedPhone && <span className={winnerPhoneText()}>{resolvedPhone}</span>}
                                    </div>
                                 </div>
                                 <span className={winnerListTicketBadge()}>{winner.ticketCode}</span>
                              </li>
                           );
                        })}
                     </ul>
                  )}
               </div>
            </div>
         )}

         <div className={stageCanvas()}>
            <img
               src={param.backgroundImage}
               alt=""
               aria-hidden="true"
               className={stageBg()}
            />

            <div className={leftZone()}>
               {param.currentPrize && <h1 className={prizeTitle()}>{param.currentPrize.name}</h1>}
               <p className={statusText()}>{param.statusText}</p>
            </div>

            <div className={rightBox()}>
               <div className={reelLayer()}>
                  <div
                     className={reelRow()}
                     style={param.reelRowStyle}
                  >
                     {param.winnerChars.map((char, index) => (
                        <SlotReel01
                           key={index}
                           targetChar={char}
                           isSpinning={param.isSpinning && index >= param.stoppedReels}
                           variant="split-flap"
                           status={func.getColumnState(index)}
                           columnIndex={index}
                           isVictory={param.isAllReelsLocked}
                           isVictoryRevealed={param.isVictoryRevealed}
                        />
                     ))}
                  </div>
               </div>

               {param.isWinnerCardVisible && param.revealedWinnerCard && (
                  <div className={winnerOverlay()}>
                     <button
                        type="button"
                        onClick={func.handleCloseWinnerOverlay}
                        title={func.translate('theme_03.close_winner_overlay')}
                        aria-label={func.translate('theme_03.close_winner_overlay')}
                        className={winnerCloseBtn()}
                     >
                        <X className={winnerCloseIcon()} />
                     </button>

                     <span className={winnerTicketBadge()}>{param.revealedWinnerCard.ticketCode}</span>

                     {param.revealedWinnerCard.companyName && (
                        <p className={winnerCompany()}>{param.revealedWinnerCard.companyName}</p>
                     )}

                     <h2 className={winnerName({ compact: param.revealedWinnerCard.isCompactName })}>
                        {param.revealedWinnerCard.displayName}
                     </h2>

                     {param.revealedWinnerCard.displayPhone && (
                        <span className={winnerPhonePill()}>
                           <Phone className={winnerPhoneIcon()} />
                           <span>{param.revealedWinnerCard.displayPhone}</span>
                        </span>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
