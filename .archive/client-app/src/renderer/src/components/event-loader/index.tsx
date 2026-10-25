import { DRAW_MODES, useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { EventLoaderProps } from './use-logic';

export const EventLoader = (props: EventLoaderProps) => {
   const { param, func } = useLogic(props);
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
      manualStopBtn,
      redrawAbsentBtn,
   } = useStyle;

   if (param.hideHud) {
      return null;
   }

   if (param.collapsed) {
      const isDrawDisabled = (param.isSpinning && param.drawMode !== 'instant') || param.currentPrizeDone;
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
               {param.prizes.length > 0 && (
                  <button
                     type="button"
                     onClick={func.handleStartDraw}
                     disabled={isDrawDisabled}
                     className={collapsedDrawBtn({ disabled: isDrawDisabled })}
                  >
                     {param.isSpinning ? 'Spinning...' : 'Draw'}
                  </button>
               )}

               {param.drawMode === 'manual' && param.isSpinning && (
                  <button
                     type="button"
                     onClick={func.handleManualStop}
                     className={collapsedStopBtn()}
                  >
                     Stop ({param.stoppedReels}/{param.winnerLength})
                  </button>
               )}

               <button
                  type="button"
                  onClick={() => func.setCollapsed(false)}
                  title="Expand operator controls"
                  className={collapsedExpandBtn()}
               >
                  Operator ▲
               </button>
            </div>
         </div>
      );
   }

   const isStartDisabled =
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
                     title={param.isRealtimeConnected ? 'Realtime Check-In Connected' : 'Operator Ready'}
                  />
                  <h4 className={cardHeaderTitle()}>Operator Controls</h4>
               </div>

               <div className={cardHeaderActions()}>
                  {param.selectedGameId && (
                     <button
                        type="button"
                        onClick={func.handleSyncGame}
                        disabled={param.busy}
                        title="Reload checked-in guests & prizes from Supabase"
                        className={syncBtn({ disabled: param.busy })}
                     >
                        {param.isLoadingGame ? 'Syncing...' : '↻ Sync'}
                     </button>
                  )}
                  <button
                     type="button"
                     onClick={() => func.setCollapsed(true)}
                     title="Minimize panel"
                     className={minimizeBtn()}
                  >
                     Minimize ▼
                  </button>
               </div>
            </div>

            <div className={selectorsGroup()}>
               <div className={fieldGroup()}>
                  <label className={fieldLabel()}>Event</label>
                  <select
                     value={param.selectedEventId}
                     onChange={func.handleEventChange}
                     disabled={param.busy}
                     className={selectInput({ disabled: param.busy })}
                  >
                     <option value="">-- Select Event --</option>
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
                  <label className={fieldLabel()}>Lucky Draw Game</label>
                  <select
                     value={param.selectedGameId}
                     onChange={func.handleGameChange}
                     disabled={!param.games.length || param.busy}
                     className={selectInput({ disabled: !param.games.length || param.busy })}
                  >
                     <option value="">-- Select Game --</option>
                     {param.games.map((g) => (
                        <option
                           key={g.id}
                           value={g.id}
                        >
                           {g.name}
                        </option>
                     ))}
                  </select>
               </div>

               <div className={fieldGroup()}>
                  <div className={fieldHeaderRow()}>
                     <label className={fieldLabel()}>Active Prize</label>
                     {param.currentPrize && (
                        <button
                           type="button"
                           onClick={func.handleToggleWinners}
                           className={winnersToggleBtn()}
                        >
                           {param.showWinners ? 'Hide Winners (W)' : 'Show Winners (W)'}
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
                        -- Select Prize --
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
            </div>

            {param.selectedGameId && (
               <div className={telemetryGrid()}>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>Checked In</div>
                     <div className={telemetryValue({ tone: 'white' })}>{param.stats.scanned}</div>
                  </div>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>Eligible</div>
                     <div className={telemetryValue({ tone: 'emerald' })}>{param.stats.eligible}</div>
                  </div>
                  <div className={telemetryBox()}>
                     <div className={telemetryLabel()}>Drawn</div>
                     <div className={telemetryValue({ tone: 'yellow' })}>
                        {param.stats.totalWon}/{param.stats.totalPrizes}
                     </div>
                  </div>
               </div>
            )}

            {param.prizes.length > 0 && (
               <div className={controlsSection()}>
                  <div className={fieldGroup()}>
                     <label className={fieldLabel()}>Draw Mode</label>
                     <div className={modeTabGroup()}>
                        {DRAW_MODES.map((mode) => {
                           const active = param.drawMode === mode;
                           return (
                              <button
                                 key={mode}
                                 type="button"
                                 disabled={param.isSpinning}
                                 onClick={() => func.setDrawMode(mode)}
                                 className={modeTabBtn({ active, disabled: param.isSpinning })}
                              >
                                 {mode}
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
                        {param.isSpinning
                           ? 'Spinning Reels...'
                           : param.currentPrizeDone
                             ? 'Prize Pool Completed'
                             : 'Start Draw'}
                     </button>

                     {param.drawMode === 'manual' && param.isSpinning && (
                        <button
                           type="button"
                           onClick={func.handleManualStop}
                           className={manualStopBtn()}
                        >
                           Stop Next Reel ({param.stoppedReels}/{param.winnerLength}) · Space
                        </button>
                     )}

                     {param.canRedrawAbsent && (
                        <button
                           type="button"
                           onClick={func.handleRedrawAbsent}
                           className={redrawAbsentBtn()}
                        >
                           Redraw ({param.activeWinnerId} Absent)
                        </button>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

