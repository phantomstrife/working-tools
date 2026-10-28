'use client';

import { Loader2 } from 'lucide-react';

import { DRAW_MODES, useLogic } from './use-logic';
import { useStyle } from './use-style';

export const GameSettings: AdminWeb.Component<object> = () => {
   const { param, func } = useLogic();
   const {
      collapsedContainer,
      expandedContainer,
      noticeBanner,
      noticeCloseBtn,
      collapsedPill,
      collapsedDrawBtn,
      collapsedStopBtn,
      collapsedExpandBtn,
      operatorCard,
      cardHeader,
      cardHeaderTitleGroup,
      statusDot,
      cardHeaderTitle,
      cardHeaderActions,
      syncBtn,
      minimizeBtn,
      accountRow,
      accountName,
      accountActions,
      guardSwitchBtn,
      logoutBtn,
      selectorsGroup,
      fieldGroup,
      fieldHeaderRow,
      fieldLabel,
      winnersToggleBtn,
      selectInput,
      telemetryGrid,
      telemetryBox,
      telemetryLabel,
      telemetryValue,
      controlsSection,
      modeTabGroup,
      modeTabBtn,
      actionButtonsStack,
      startDrawBtn,
      spinnerIcon,
      manualStopBtn,
      redrawAbsentBtn,
      shortcutHint,
   } = useStyle;

   if (param.hideHud) {
      return null;
   }

   if (param.collapsed) {
      const isDrawDisabled =
         param.isDrawingRequest ||
         (param.isSpinning && param.drawMode !== 'instant') ||
         param.currentPrizeDone;
      return (
         <div className={collapsedContainer()}>
            {param.notice && (
               <div
                  onClick={func.clearNotice}
                  className={noticeBanner({ kind: param.notice.kind })}
               >
                  <span>{param.notice.text}</span>
               </div>
            )}

            <div className={collapsedPill()}>
               {param.isLuckyDrawGame && param.prizes.length > 0 && (
                  <button
                     type="button"
                     onClick={func.handleStartDraw}
                     disabled={isDrawDisabled}
                     className={collapsedDrawBtn({ disabled: isDrawDisabled })}
                  >
                     {(param.isDrawingRequest || param.isSpinning) && (
                        <Loader2 className={spinnerIcon()} />
                     )}
                     <span>
                        {param.isDrawingRequest
                           ? func.translate('preparing_short')
                           : param.isSpinning
                             ? func.translate('spinning_short')
                             : func.translate('draw_short')}
                     </span>
                  </button>
               )}

               {param.isLuckyDrawGame && param.drawMode === 'manual' && param.isSpinning && (
                  <button
                     type="button"
                     onClick={func.handleManualStop}
                     className={collapsedStopBtn()}
                  >
                     {func.translate('stop_short')} ({param.stoppedReels}/{param.winnerLength})
                  </button>
               )}

               <button
                  type="button"
                  onClick={() => func.setCollapsed(false)}
                  title={func.translate('expand_tooltip')}
                  className={collapsedExpandBtn()}
               >
                  {func.translate('operator_pill')} ▲
               </button>
            </div>
         </div>
      );
   }

   const isStartDisabled =
      param.isDrawingRequest ||
      (param.isSpinning && param.drawMode !== 'instant') ||
      param.prizes.length === 0 ||
      param.currentPrizeDone;

   return (
      <div className={expandedContainer()}>
         {param.notice && (
            <div className={noticeBanner({ kind: param.notice.kind })}>
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
            <div className={cardHeader()}>
               <div className={cardHeaderTitleGroup()}>
                  <span
                     className={statusDot({ live: param.isRealtimeConnected })}
                     title={
                        param.isRealtimeConnected
                           ? func.translate('realtime_connected')
                           : func.translate('operator_ready')
                     }
                  />
                  <h4 className={cardHeaderTitle()}>{func.translate('title')}</h4>
               </div>

               <div className={cardHeaderActions()}>
                  <button
                     type="button"
                     onClick={func.handleSyncGame}
                     disabled={param.busy}
                     title={func.translate('sync_tooltip')}
                     className={syncBtn({ disabled: param.busy })}
                  >
                     {param.isLoadingGame ? func.translate('syncing') : `↻ ${func.translate('sync')}`}
                  </button>
                  <button
                     type="button"
                     onClick={() => func.setCollapsed(true)}
                     title={func.translate('minimize_tooltip')}
                     className={minimizeBtn()}
                  >
                     {func.translate('minimize')} ▼
                  </button>
               </div>
            </div>

            {param.account && (
               <div className={accountRow()}>
                  <span className={accountName()}>{param.account.full_name}</span>
                  <div className={accountActions()}>
                     {param.canSwitchModes && param.dashboardPath && (
                        <button
                           type="button"
                           onClick={func.handleSwitchToDashboard}
                           className={guardSwitchBtn()}
                        >
                           {func.translate('switch_to_dashboard')}
                        </button>
                     )}
                     {param.canSwitchModes && (
                        <button
                           type="button"
                           onClick={func.handleSwitchToGuard}
                           className={guardSwitchBtn()}
                        >
                           {func.translate('switch_to_guard')}
                        </button>
                     )}
                     <button
                        type="button"
                        onClick={func.handleLogout}
                        className={logoutBtn()}
                     >
                        {func.translate('logout')}
                     </button>
                  </div>
               </div>
            )}

            <div className={selectorsGroup()}>
               <div className={fieldGroup()}>
                  <label className={fieldLabel()}>{func.translate('event_label')}</label>
                  <select
                     value={param.selectedEventId}
                     onChange={func.handleEventChange}
                     disabled={param.busy}
                     className={selectInput({ disabled: param.busy })}
                  >
                     <option value="">{func.translate('event_placeholder')}</option>
                     {param.events.map((ev) => (
                        <option
                           key={ev.id}
                           value={ev.id}
                        >
                           {ev.name}
                        </option>
                     ))}
                  </select>
               </div>

               <div className={fieldGroup()}>
                  <label className={fieldLabel()}>{func.translate('game_label')}</label>
                  <select
                     value={param.selectedGameId}
                     onChange={func.handleGameChange}
                     disabled={!param.games.length || param.busy}
                     className={selectInput({ disabled: !param.games.length || param.busy })}
                  >
                     <option value="">{func.translate('game_placeholder')}</option>
                     {param.games.map((g) => (
                        <option
                           key={g.id}
                           value={g.id}
                        >
                           {g.name} ({g.game_type})
                        </option>
                     ))}
                  </select>
               </div>

               {param.isLuckyDrawGame && (
                  <div className={fieldGroup()}>
                     <div className={fieldHeaderRow()}>
                        <label className={fieldLabel()}>{func.translate('prize_label')}</label>
                        {param.currentPrize && (
                           <button
                              type="button"
                              onClick={func.handleToggleWinners}
                              className={winnersToggleBtn()}
                           >
                              {param.showWinners
                                 ? func.translate('hide_winners')
                                 : func.translate('show_winners')}
                           </button>
                        )}
                     </div>
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
                           const won = param.stats.wonByPrize.get(p.id) ?? 0;
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
                  </div>
               )}
            </div>

            {param.selectedGameId && param.isLuckyDrawGame && (
               <div className={telemetryGrid()}>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>{func.translate('telemetry.checked_in')}</div>
                     <div className={telemetryValue({ tone: 'white' })}>{param.stats.scanned}</div>
                  </div>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>{func.translate('telemetry.eligible')}</div>
                     <div className={telemetryValue({ tone: 'emerald' })}>{param.stats.eligible}</div>
                  </div>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>{func.translate('telemetry.drawn')}</div>
                     <div className={telemetryValue({ tone: 'yellow' })}>
                        {param.stats.totalWon}/{param.stats.totalPrizes}
                     </div>
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
                        {(param.isDrawingRequest || param.isSpinning) && (
                           <Loader2 className={spinnerIcon()} />
                        )}
                        <span>
                           {param.isDrawingRequest
                              ? func.translate('preparing_draw')
                              : param.isSpinning
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
                              stopped: param.stoppedReels,
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
         </div>
      </div>
   );
};

export const EventLoader = GameSettings;

