import { QrScanner } from '@renderer/components/gate/qr-scanner';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { GatePageProps } from './use-logic';

export const GatePage = (props: GatePageProps) => {
   const { param, func } = useLogic(props);
   const {
      page,
      container,
      header,
      headerLeft,
      headerTitle,
      headerSubtitle,
      headerActions,
      backBtn,
      signOutBtn,
      selectorGrid,
      selectField,
      noticeBanner,
      emptySelectionBox,
      workspaceGrid,
      columnSection,
      sectionHeading,
      pendingCard,
      pendingName,
      detailsGrid,
      detailTerm,
      detailValue,
      detailTicket,
      warningAlert,
      pendingActions,
      confirmBtn,
      cancelBtn,
      resultsContainer,
      resultsPlaceholder,
      resultsList,
      resultRow,
      resultInfo,
      resultName,
      resultContact,
      resultMetaRow,
      resultTicket,
      resultStatusBadge,
      selectGuestBtn,
   } = useStyle;

   const isConfirmDisabled = param.confirming || param.wrongGame || param.alreadyIn;

   return (
      <div className={page()}>
         <div className={container()}>
            <header className={header()}>
               <div className={headerLeft()}>
                  <h1 className={headerTitle()}>Gate Check-In</h1>
                  <p className={headerSubtitle()}>Signed in as {param.fullName}</p>
               </div>

               <div className={headerActions()}>
                  {param.hasBackButton && func.onBack && (
                     <button
                        type="button"
                        onClick={func.onBack}
                        className={backBtn()}
                     >
                        Back to Lucky Draw
                     </button>
                  )}
                  <button
                     type="button"
                     onClick={func.onSignOut}
                     className={signOutBtn()}
                  >
                     Sign Out
                  </button>
               </div>
            </header>

            <div className={selectorGrid()}>
               <select
                  value={param.eventId}
                  onChange={func.handleEventChange}
                  className={selectField()}
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

               <select
                  value={param.gameId}
                  onChange={func.handleGameChange}
                  disabled={!param.games.length}
                  className={selectField({ disabled: !param.games.length })}
               >
                  <option value="">-- Select Lucky Draw Game --</option>
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

            {param.notice && (
               <div className={noticeBanner({ kind: param.notice.kind })}>{param.notice.text}</div>
            )}

            {!param.gameId ? (
               <div className={emptySelectionBox()}>
                  Select an event and a Lucky Draw game above to start checking guests in.
               </div>
            ) : (
               <div className={workspaceGrid()}>
                  <section className={columnSection()}>
                     <h2 className={sectionHeading()}>Scan QR Code</h2>
                     <QrScanner
                        onScan={func.handleScan}
                        paused={Boolean(param.pending)}
                     />

                     {param.pending && (
                        <div className={pendingCard()}>
                           <div className={pendingName()}>{param.pending.attendant.full_name}</div>
                           <dl className={detailsGrid()}>
                              <dt className={detailTerm()}>Ticket</dt>
                              <dd className={detailTicket()}>{param.pending.attendant.ticket_code}</dd>

                              <dt className={detailTerm()}>Email</dt>
                              <dd className={detailValue()}>{param.pending.attendant.email || '—'}</dd>

                              <dt className={detailTerm()}>Phone</dt>
                              <dd className={detailValue()}>{param.pending.attendant.phone || '—'}</dd>

                              <dt className={detailTerm()}>Organization</dt>
                              <dd className={detailValue()}>
                                 {[param.pending.attendant.company_name, param.pending.attendant.department]
                                    .filter(Boolean)
                                    .join(' • ') || '—'}
                              </dd>

                              <dt className={detailTerm()}>Game</dt>
                              <dd className={detailValue()}>
                                 {param.pending.attendant.event_name} — {param.pending.attendant.game_name}
                              </dd>

                              <dt className={detailTerm()}>Status</dt>
                              <dd className={detailValue()}>
                                 {param.pending.attendant.is_checked_in ? 'Checked In' : 'Pending Check-In'}
                              </dd>
                           </dl>

                           {param.wrongGame && (
                              <p className={warningAlert()}>
                                 This pass belongs to another game ({param.pending.attendant.game_name}). Switch to
                                 that game to check this guest in.
                              </p>
                           )}

                           {param.alreadyIn && (
                              <p className={warningAlert()}>
                                 Already checked in {func.formatCheckedInDetails(param.pending.attendant)}.
                              </p>
                           )}

                           <div className={pendingActions()}>
                              <button
                                 type="button"
                                 onClick={func.confirmCheckin}
                                 disabled={isConfirmDisabled}
                                 className={confirmBtn({ disabled: isConfirmDisabled })}
                              >
                                 {param.confirming ? 'Checking in...' : 'Confirm Check-In'}
                              </button>
                              <button
                                 type="button"
                                 onClick={func.handleCancelPending}
                                 className={cancelBtn()}
                              >
                                 Cancel
                              </button>
                           </div>
                        </div>
                     )}
                  </section>

                  <section className={columnSection()}>
                     <h2 className={sectionHeading()}>Manual Guest Search</h2>
                     <input
                        type="search"
                        value={param.query}
                        onChange={func.handleQueryChange}
                        placeholder="Search by name, email, phone, ticket code, or company..."
                        className={selectField()}
                     />

                     <div className={resultsContainer()}>
                        {!param.query.trim() ? (
                           <p className={resultsPlaceholder()}>Type above to search attendees in this game.</p>
                        ) : param.searching && param.results.length === 0 ? (
                           <p className={resultsPlaceholder()}>Searching...</p>
                        ) : param.results.length === 0 ? (
                           <p className={resultsPlaceholder()}>No matching attendee found.</p>
                        ) : (
                           <ul className={resultsList()}>
                              {param.results.map((r) => (
                                 <li
                                    key={r.id}
                                    className={resultRow()}
                                 >
                                    <div className={resultInfo()}>
                                       <div className={resultName()}>{r.full_name}</div>
                                       <div className={resultContact()}>
                                          {[r.email, r.phone, r.company_name].filter(Boolean).join(' · ') ||
                                             'No contact info'}
                                       </div>
                                       <div className={resultMetaRow()}>
                                          <span className={resultTicket()}>{r.ticket_code}</span>
                                          <span className={resultStatusBadge({ checkedIn: r.is_checked_in })}>
                                             {r.is_checked_in ? 'Checked In' : 'Pending'}
                                          </span>
                                       </div>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => func.handleSelectManualGuest(r)}
                                       className={selectGuestBtn()}
                                    >
                                       Select
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </section>
               </div>
            )}
         </div>
      </div>
   );
};

