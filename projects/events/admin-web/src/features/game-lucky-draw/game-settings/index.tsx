'use client';

import { Loader2, RefreshCw } from 'lucide-react';

import { DRAW_MODES, useLogic } from './use-logic';
import { useStyle } from './use-style';

export const GameSettings: AdminWeb.Component<object> = () => {
   const { param, func } = useLogic();
   const {
      expandedContainer,
      noticeBanner,
      noticeCloseBtn,
      operatorCard,
      fieldGroup,
      fieldLabel,
      prizeRow,
      selectInput,
      syncIconBtn,
      syncIcon,
      controlsSection,
      modeTabGroup,
      modeTabBtn,
      actionButtonsStack,
      startDrawBtn,
      spinnerIcon,
      manualStopBtn,
      redrawAbsentBtn,
      shortcutHint,
      logoutWrapper,
      logoutBtn,
   } = useStyle;

   if (param.hideHud) {
      return null;
   }

   const isStartDisabled =
      param.isDrawingRequest || param.isSpinning || param.prizes.length === 0 || param.currentPrizeDone;
   const displayedStoppedReels = Math.min(param.winnerLength, param.stoppedReels + param.queuedManualStops);

   return (
      <div className={expandedContainer()}>
         {param.notice && (
            <div
               onClick={func.clearNotice}
               className={noticeBanner({ kind: param.notice.kind })}
            >
               <span>{param.notice.text}</span>
               <button
                  type="button"
                  onClick={func.clearNotice}
                  className={noticeCloseBtn()}
               >
                  ×
               </button>
            </div>
         )}

         <div className={operatorCard()}>
            {param.isLuckyDrawGame && (
               <div className={fieldGroup()}>
                  <label className={fieldLabel()}>{func.translate('prize_label')}</label>
                  <div className={prizeRow()}>
                     <select
                        value={param.prizes.length ? param.currentPrizeIndex : ''}
                        onChange={func.handlePrizeChange}
                        disabled={!param.prizes.length || param.busy}
                        className={selectInput({ disabled: !param.prizes.length || param.busy })}
                     >
                        <option
                           value=""
                           disabled
                        >
                           {func.translate('prize_placeholder')}
                        </option>
                        {param.prizes.map((p, i) => {
                           const won = param.wonByPrize.get(p.id) ?? 0;
                           const done = p.remainingQuantity <= 0;
                           return (
                              <option
                                 key={p.id}
                                 value={i}
                              >
                                 {done ? '✓ ' : ''}#{p.tierOrder} {p.name} ({won}/{p.totalQuantity})
                              </option>
                           );
                        })}
                     </select>
                     <button
                        type="button"
                        onClick={func.handleSyncGame}
                        disabled={param.busy}
                        title={func.translate('sync_tooltip')}
                        className={syncIconBtn({ disabled: param.busy })}
                     >
                        <RefreshCw className={syncIcon({ loading: param.isLoadingGame })} />
                     </button>
                  </div>
               </div>
            )}

            {param.isLuckyDrawGame && param.prizes.length > 0 && (
               <div className={controlsSection()}>
                  <div className={fieldGroup()}>
                     <label className={fieldLabel()}>{func.translate('draw_mode_label')}</label>
                     <div className={modeTabGroup()}>
                        {DRAW_MODES.map((mode) => {
                           const active = param.drawMode === mode;
                           const modeDisabled = param.isSpinning || param.isDrawingRequest;
                           return (
                              <button
                                 key={mode}
                                 type="button"
                                 disabled={modeDisabled}
                                 onClick={() => func.setDrawMode(mode)}
                                 className={modeTabBtn({ active, disabled: modeDisabled })}
                              >
                                 {func.translate(`modes.${mode}`)}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div className={actionButtonsStack()}>
                     <button
                        type="button"
                        onClick={func.handleStartDraw}
                        disabled={isStartDisabled}
                        className={startDrawBtn({ disabled: isStartDisabled })}
                     >
                        {(param.isDrawingRequest || param.isSpinning) && <Loader2 className={spinnerIcon()} />}
                        <span>
                           {param.isSpinning || param.isDrawingRequest
                              ? func.translate('spinning_reels')
                              : param.currentPrizeDone
                                ? func.translate('prize_completed')
                                : func.translate('start_draw')}
                        </span>
                     </button>

                     {param.drawMode === 'manual' && param.isSpinning && (
                        <button
                           type="button"
                           onClick={func.handleManualStop}
                           className={manualStopBtn()}
                        >
                           {func.translate('stop_next_reel', {
                              stopped: displayedStoppedReels,
                              total: param.winnerLength,
                           })}
                        </button>
                     )}

                     {param.canRedrawAbsent && (
                        <button
                           type="button"
                           onClick={func.handleRedrawAbsent}
                           className={redrawAbsentBtn()}
                        >
                           {func.translate('redraw_absent', { ticket: param.activeWinnerId ?? '' })}
                        </button>
                     )}
                  </div>
               </div>
            )}

            <div className={shortcutHint()}>{func.translate('shortcuts_hint')}</div>

            <div className={logoutWrapper()}>
               <button
                  type="button"
                  onClick={func.handleLogout}
                  className={logoutBtn()}
               >
                  {func.translate('logout')}
               </button>
            </div>
         </div>
      </div>
   );
};

export const EventLoader = GameSettings;
