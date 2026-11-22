'use client';

import { GripHorizontal, Loader2, RefreshCw, RotateCcw } from 'lucide-react';

import { DRAW_MODES, RESIZE_DIRECTIONS, useLogic } from './use-logic';
import { useStyle } from './use-style';

export const GameSettings: AdminWeb.Component<object> = () => {
   const { containerRef, param, func } = useLogic();
   const {
      expandedContainer,
      resizeHandle,
      operatorCard,
      dragBar,
      dragBarSpacer,
      dragGripIcon,
      resetBoxBtn,
      cardBody,
      noticeBanner,
      noticeText,
      noticeCloseBtn,
      bodyGrid,
      fieldGroup,
      modeColumn,
      fieldLabel,
      prizeRow,
      selectInput,
      syncIconBtn,
      syncIcon,
      modeTabGroup,
      modeTabBtn,
      actionButtonsStack,
      startDrawBtn,
      actionBtnText,
      spinnerIcon,
      manualStopBtn,
      redrawAbsentBtn,
      footerRow,
      shortcutHint,
      logoutWrapper,
      logoutBtn,
      cornerGrip,
   } = useStyle;

   if (param.hideHud) {
      return null;
   }

   const isStartDisabled =
      param.isDrawingRequest || param.isSpinning || param.prizes.length === 0 || param.currentPrizeDone;
   const displayedStoppedReels = Math.min(param.winnerLength, param.stoppedReels + param.queuedManualStops);
   const isCompactNotice = param.layoutMode === 'compact' || param.heightMode === 'short';

   return (
      <div
         ref={containerRef}
         className={expandedContainer({ interacting: param.isInteracting })}
         style={param.containerStyle}
      >
         {RESIZE_DIRECTIONS.map((direction) => (
            <div
               key={direction}
               role="presentation"
               aria-hidden="true"
               onPointerDown={(event) => func.handleResizeStart(direction, event)}
               className={resizeHandle({ direction })}
            />
         ))}

         {param.notice && (
            <div
               onClick={func.clearNotice}
               className={noticeBanner({ kind: param.notice.kind, compact: isCompactNotice })}
            >
               <span className={noticeText()}>{param.notice.text}</span>
               <button
                  type="button"
                  onClick={func.clearNotice}
                  className={noticeCloseBtn()}
               >
                  ×
               </button>
            </div>
         )}
         <div className={operatorCard({ active: param.isInteracting })}>
            <div
               onPointerDown={func.handleDragStart}
               onDoubleClick={func.handleResetBox}
               title={func.translate('drag_hint')}
               className={dragBar({ dragging: param.isDragging })}
            >
               <span
                  aria-hidden="true"
                  className={dragBarSpacer()}
               />
               <GripHorizontal
                  size={14}
                  className={dragGripIcon()}
               />
               <button
                  type="button"
                  onClick={func.handleResetBox}
                  onPointerDown={(event) => event.stopPropagation()}
                  title={func.translate('reset_box_tooltip')}
                  aria-label={func.translate('reset_box_tooltip')}
                  className={resetBoxBtn()}
               >
                  <RotateCcw size={12} />
               </button>
            </div>

            <div className={cardBody({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
               <div className={bodyGrid({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
                  {param.isLuckyDrawGame && (
                     <div className={fieldGroup({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
                        <label className={fieldLabel({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
                           {func.translate('prize_label')}
                        </label>
                        <div className={prizeRow({ layoutMode: param.layoutMode })}>
                           <select
                              value={param.prizes.length ? param.currentPrizeIndex : ''}
                              onChange={func.handlePrizeChange}
                              disabled={!param.prizes.length || param.busy}
                              className={selectInput({
                                 layoutMode: param.layoutMode,
                                 heightMode: param.heightMode,
                                 disabled: !param.prizes.length || param.busy,
                              })}
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
                              className={syncIconBtn({
                                 layoutMode: param.layoutMode,
                                 heightMode: param.heightMode,
                                 disabled: param.busy,
                              })}
                           >
                              <RefreshCw className={syncIcon({ loading: param.isLoadingGame })} />
                           </button>
                        </div>
                     </div>
                  )}

                  {param.isLuckyDrawGame && param.prizes.length > 0 && (
                     <>
                        <div className={modeColumn({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
                           <label
                              className={fieldLabel({ layoutMode: param.layoutMode, heightMode: param.heightMode })}
                           >
                              {func.translate('draw_mode_label')}
                           </label>
                           <div className={modeTabGroup({ layoutMode: param.layoutMode })}>
                              {DRAW_MODES.map((mode) => {
                                 const active = param.drawMode === mode;
                                 const modeDisabled = param.isSpinning || param.isDrawingRequest;
                                 return (
                                    <button
                                       key={mode}
                                       type="button"
                                       disabled={modeDisabled}
                                       onClick={() => func.setDrawMode(mode)}
                                       className={modeTabBtn({
                                          layoutMode: param.layoutMode,
                                          heightMode: param.heightMode,
                                          active,
                                          disabled: modeDisabled,
                                       })}
                                    >
                                       {func.translate(`modes.${mode}`)}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>

                        <div
                           className={actionButtonsStack({
                              layoutMode: param.layoutMode,
                              heightMode: param.heightMode,
                           })}
                        >
                           <button
                              type="button"
                              onClick={func.handleStartDraw}
                              disabled={isStartDisabled}
                              className={startDrawBtn({
                                 layoutMode: param.layoutMode,
                                 heightMode: param.heightMode,
                                 disabled: isStartDisabled,
                              })}
                           >
                              {(param.isDrawingRequest || param.isSpinning) && <Loader2 className={spinnerIcon()} />}
                              <span className={actionBtnText()}>
                                 {param.isSpinning || param.isDrawingRequest
                                    ? func.translate('spinning_reels')
                                    : param.currentPrizeDone
                                      ? func.translate('prize_completed')
                                      : func.translate('start_draw')}
                              </span>
                           </button>

                           {param.drawMode === 'manual' &&
                              param.isSpinning &&
                              param.stoppedReels < param.winnerLength && (
                              <button
                                 type="button"
                                 onClick={func.handleManualStop}
                                 className={manualStopBtn({
                                    layoutMode: param.layoutMode,
                                    heightMode: param.heightMode,
                                 })}
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
                                 className={redrawAbsentBtn({
                                    layoutMode: param.layoutMode,
                                    heightMode: param.heightMode,
                                 })}
                              >
                                 <span className={actionBtnText()}>
                                    {func.translate('redraw_absent', { ticket: param.activeWinnerId ?? '' })}
                                 </span>
                              </button>
                           )}
                           <div className={logoutWrapper({ layoutMode: param.layoutMode })}>
                              <button
                                 type="button"
                                 onClick={func.handleLogout}
                                 className={logoutBtn()}
                              >
                                 {func.translate('logout')}
                              </button>
                           </div>
                        </div>
                     </>
                  )}
               </div>

               {/* <div className={footerRow({ layoutMode: param.layoutMode, heightMode: param.heightMode })}>
                  <div
                     title={func.translate('shortcuts_hint')}
                     className={shortcutHint({ layoutMode: param.layoutMode, heightMode: param.heightMode })}
                  >
                     {func.translate('shortcuts_hint')}
                  </div>

                  <div className={logoutWrapper({ layoutMode: param.layoutMode })}>
                     <button
                        type="button"
                        onClick={func.handleLogout}
                        className={logoutBtn()}
                     >
                        {func.translate('logout')}
                     </button>
                  </div>
               </div> */}
            </div>

            <span
               aria-hidden="true"
               className={cornerGrip()}
            />
         </div>
      </div>
   );
};

export const EventLoader = GameSettings;
