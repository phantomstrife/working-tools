import { useRef } from 'react';
import {
   AlertTriangle,
   Camera,
   CameraOff,
   CheckCircle2,
   Clock,
   Keyboard,
   QrCode,
   RefreshCw,
   Search,
   UserCheck,
   Users,
   X,
   XCircle,
} from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const GuardCheckIn: ClientApp.Component<Types.Properties> = (properties) => {
   const scannerInputRef = useRef<HTMLInputElement>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const { state, param, func } = useLogic(properties, scannerInputRef, videoRef, canvasRef);
   const { root, stats, card, qr, feedback, manual } = useStyle;

   const formatDateTime = (isoOrEpoch: string | number | null) => {
      if (!isoOrEpoch) {
         return '—';
      }

      return new Date(isoOrEpoch).toLocaleTimeString('vi-VN', {
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
      });
   };

   return (
      <div className={root.wrapper}>
         <div className={stats.wrapper}>
            <div className={stats.card}>
               <div className={stats.header}>
                  <span>{func.translate('stats.checked_in')}</span>
                  <UserCheck size={16} />
               </div>
               <div className={stats.value_row}>
                  <span className={stats.value_success}>{state.checkedInCount}</span>
               </div>
            </div>

            <div className={stats.card}>
               <div className={stats.header}>
                  <span>{func.translate('stats.remaining')}</span>
                  <Clock size={16} />
               </div>
               <div className={stats.value_row}>
                  <span className={stats.value}>{param.remainingCount}</span>
               </div>
            </div>

            <div className={stats.card}>
               <div className={stats.header}>
                  <span>{func.translate('stats.total')}</span>
                  <Users size={16} />
               </div>
               <div className={stats.value_row}>
                  <span className={stats.value}>{state.totalCount}</span>
                  <button
                     type="button"
                     disabled={state.isStatsLoading}
                     onClick={func.fetchStats}
                     className={stats.refresh_btn}
                  >
                     <RefreshCw className={stats.refresh_icon({ loading: state.isStatsLoading })} />
                     {func.translate('stats.refresh')}
                  </button>
               </div>
            </div>

            <div className={stats.card}>
               <div className={stats.header}>
                  <span>{func.translate('stats.rate')}</span>
                  <span>{param.attendanceRate}%</span>
               </div>
               <div className={stats.value_row}>
                  <span className={stats.value}>{param.attendanceRate}%</span>
               </div>
               <div className={stats.progress_track}>
                  <div
                     className={stats.progress_fill}
                     style={{ width: `${param.attendanceRate}%` }}
                  />
               </div>
            </div>
         </div>

         <div className={root.grid}>
            <div className={root.left_col}>
               <div className={card.wrapper}>
                  <div className={card.header}>
                     <div className={card.title_row}>
                        <h3 className={card.title}>
                           <QrCode size={18} />
                           {func.translate('qr.title')}
                        </h3>
                     </div>
                     <p className={card.subtitle}>{func.translate('qr.subtitle')}</p>
                  </div>

                  <div className={qr.tabs}>
                     <button
                        type="button"
                        className={qr.tab({ active: state.qrMode === 'SCANNER' })}
                        onClick={() => func.handleSelectQrMode('SCANNER')}
                     >
                        <Keyboard size={15} />
                        {func.translate('qr.modes.scanner')}
                     </button>
                     <button
                        type="button"
                        className={qr.tab({ active: state.qrMode === 'CAMERA' })}
                        onClick={() => func.handleSelectQrMode('CAMERA')}
                     >
                        <Camera size={15} />
                        {func.translate('qr.modes.camera')}
                     </button>
                  </div>

                  {state.qrMode === 'SCANNER' ? (
                     <form
                        className={qr.form}
                        onSubmit={func.handleQrFormSubmit}
                     >
                        <span className={qr.label}>{func.translate('qr.scanner_input_label')}</span>
                        <div className={qr.input_row}>
                           <div className={qr.input_wrapper}>
                              <QrCode size={16} />
                              <input
                                 ref={scannerInputRef}
                                 type="text"
                                 autoFocus
                                 value={state.qrInput}
                                 disabled={state.isQrSubmitting}
                                 placeholder={func.translate('qr.scanner_placeholder')}
                                 onChange={(event) => func.setState(event.target.value, 'qrInput')}
                                 className={qr.input}
                              />
                              {state.qrInput && (
                                 <button
                                    type="button"
                                    onClick={() => func.setState('', 'qrInput')}
                                    className={manual.clear_btn}
                                 >
                                    <X size={15} />
                                 </button>
                              )}
                           </div>
                           <button
                              type="submit"
                              disabled={param.isQrSubmitDisabled}
                              className={qr.submit({ disabled: param.isQrSubmitDisabled })}
                           >
                              {func.translate(`qr.submit_scanning_${state.isQrSubmitting}`)}
                           </button>
                        </div>
                        <span className={qr.hint}>{func.translate('qr.scanner_hint')}</span>
                     </form>
                  ) : (
                     <div className={qr.camera.wrapper}>
                        <div className={qr.camera.viewport}>
                           <video
                              ref={videoRef}
                              playsInline
                              muted
                              className={qr.camera.video}
                           />
                           <canvas
                              ref={canvasRef}
                              className={qr.camera.hidden_canvas}
                           />
                           {state.isCameraActive ? (
                              <div className={qr.camera.overlay} />
                           ) : (
                              <div className={qr.camera.placeholder}>
                                 <Camera size={32} />
                                 <span>
                                    {state.isCameraStarting
                                       ? func.translate('qr.camera_starting')
                                       : func.translate('qr.camera_active_hint')}
                                 </span>
                              </div>
                           )}
                        </div>

                        {state.cameraError && <div className={qr.camera.error}>{state.cameraError}</div>}

                        <div className={qr.camera.controls}>
                           <span className={qr.hint}>{func.translate('qr.camera_active_hint')}</span>
                           {state.isCameraActive ? (
                              <button
                                 type="button"
                                 onClick={func.stopCamera}
                                 className={qr.camera.button({ active: true })}
                              >
                                 <CameraOff size={15} />
                                 {func.translate('qr.camera_stop')}
                              </button>
                           ) : (
                              <button
                                 type="button"
                                 disabled={state.isCameraStarting}
                                 onClick={func.startCamera}
                                 className={qr.camera.button({ active: false })}
                              >
                                 <Camera size={15} />
                                 {func.translate('qr.camera_start')}
                              </button>
                           )}
                        </div>
                     </div>
                  )}
               </div>

               <div className={card.wrapper}>
                  <div className={card.header}>
                     <h3 className={card.title}>{func.translate('feedback.title')}</h3>
                  </div>

                  {!state.lastResult ? (
                     <div className={feedback.empty}>{func.translate('feedback.empty')}</div>
                  ) : state.lastResult.kind === 'ERROR' ? (
                     <div className={feedback.banner({ kind: 'ERROR' })}>
                        <div className={feedback.top_row}>
                           <span className={feedback.badge({ kind: 'ERROR' })}>
                              <XCircle size={14} />
                              {func.translate('feedback.error_title')}
                           </span>
                           <span className={feedback.recent.time}>{formatDateTime(state.lastResult.at)}</span>
                        </div>
                        <p className={feedback.meta_value}>{state.lastResult.message}</p>
                     </div>
                  ) : (
                     <div className={feedback.banner({ kind: state.lastResult.kind })}>
                        <div className={feedback.top_row}>
                           <span className={feedback.badge({ kind: state.lastResult.kind })}>
                              {state.lastResult.kind === 'SUCCESS' ? (
                                 <CheckCircle2 size={14} />
                              ) : (
                                 <AlertTriangle size={14} />
                              )}
                              {state.lastResult.kind === 'SUCCESS'
                                 ? func.translate('feedback.success_title')
                                 : func.translate('feedback.already_title')}
                           </span>
                           <span className={feedback.recent.time}>
                              {formatDateTime(state.lastResult.attendant.checked_in_at ?? state.lastResult.at)}
                           </span>
                        </div>

                        <span className={feedback.name}>{state.lastResult.attendant.full_name}</span>

                        <div className={feedback.meta_grid}>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.ticket_label')}</span>
                              <span className={feedback.ticket_code}>{state.lastResult.attendant.ticket_code}</span>
                           </div>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.company_label')}</span>
                              <span className={feedback.meta_value}>
                                 {[state.lastResult.attendant.company_name, state.lastResult.attendant.department]
                                    .filter(Boolean)
                                    .join(' • ') || '—'}
                              </span>
                           </div>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.contact_label')}</span>
                              <span className={feedback.meta_value}>
                                 {[state.lastResult.attendant.phone, state.lastResult.attendant.email]
                                    .filter(Boolean)
                                    .join(' • ') || '—'}
                              </span>
                           </div>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.time_label')}</span>
                              <span className={feedback.meta_value}>
                                 {formatDateTime(state.lastResult.attendant.checked_in_at)}
                                 {state.lastResult.attendant.check_in_method
                                    ? ` (${func.translate(`feedback.method_${state.lastResult.attendant.check_in_method}`)})`
                                    : ''}
                              </span>
                           </div>
                        </div>
                     </div>
                  )}

                  {state.recentHistory.length > 0 && (
                     <div className={feedback.recent.wrapper}>
                        <span className={feedback.recent.title}>{func.translate('feedback.recent_title')}</span>
                        <div className={feedback.recent.list}>
                           {state.recentHistory.map((entry) => (
                              <div
                                 key={`${entry.attendant.id}-${entry.at}`}
                                 className={feedback.recent.item}
                              >
                                 <div className={feedback.recent.left}>
                                    <span className={feedback.recent.ticket}>{entry.attendant.ticket_code}</span>
                                    <span className={feedback.recent.name}>{entry.attendant.full_name}</span>
                                 </div>
                                 <span className={feedback.recent.time}>{formatDateTime(entry.at)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className={root.right_col}>
               <div className={card.wrapper}>
                  <div className={card.header}>
                     <h3 className={card.title}>
                        <Search size={18} />
                        {func.translate('manual.title')}
                     </h3>
                     <p className={card.subtitle}>{func.translate('manual.subtitle')}</p>
                  </div>

                  <div className={manual.search_bar}>
                     <Search size={16} />
                     <input
                        type="text"
                        value={state.searchKeyword}
                        placeholder={func.translate('manual.search_placeholder')}
                        onChange={(event) => func.setState(event.target.value, 'searchKeyword')}
                        className={manual.search_input}
                     />
                     {state.searchKeyword && (
                        <button
                           type="button"
                           onClick={() => func.setState('', 'searchKeyword')}
                           className={manual.clear_btn}
                        >
                           <X size={15} />
                        </button>
                     )}
                  </div>

                  {!state.searchKeyword.trim() ? (
                     <div className={manual.empty_box}>{func.translate('manual.empty_prompt')}</div>
                  ) : state.isSearching ? (
                     <div className={manual.empty_box}>{func.translate('manual.searching')}</div>
                  ) : state.searchResults.length === 0 ? (
                     <div className={manual.empty_box}>{func.translate('manual.no_results')}</div>
                  ) : (
                     <div className={manual.table_wrapper}>
                        <table className={manual.table}>
                           <thead>
                              <tr>
                                 <th className={manual.th}>{func.translate('manual.columns.attendant')}</th>
                                 <th className={manual.th}>{func.translate('manual.columns.ticket')}</th>
                                 <th className={manual.th}>{func.translate('manual.columns.company')}</th>
                                 <th className={manual.th}>{func.translate('manual.columns.status')}</th>
                                 <th className={manual.th_right}>{func.translate('manual.columns.action')}</th>
                              </tr>
                           </thead>
                           <tbody>
                              {state.searchResults.map((row) => {
                                 const isRowLoading = state.checkingInAttendantId === row.id;

                                 return (
                                    <tr
                                       key={row.id}
                                       className={manual.tr}
                                    >
                                       <td className={manual.td}>
                                          <div className={manual.attendant_name}>{row.full_name}</div>
                                          <div className={manual.attendant_sub}>
                                             {[row.phone, row.email].filter(Boolean).join(' • ') || '—'}
                                          </div>
                                       </td>
                                       <td className={manual.td}>
                                          <span className={manual.ticket_badge}>{row.ticket_code}</span>
                                       </td>
                                       <td className={manual.td}>
                                          <div>{row.company_name || '—'}</div>
                                          {row.department && (
                                             <div className={manual.attendant_sub}>{row.department}</div>
                                          )}
                                       </td>
                                       <td className={manual.td}>
                                          <span className={manual.status_badge({ checkedIn: !!row.is_checked_in })}>
                                             {row.is_checked_in
                                                ? func.translate('manual.badges.checked_in')
                                                : func.translate('manual.badges.pending')}
                                          </span>
                                       </td>
                                       <td className={manual.td_right}>
                                          <button
                                             type="button"
                                             disabled={Boolean(state.checkingInAttendantId)}
                                             onClick={() => func.handleManualCheckIn(row)}
                                             className={manual.action_btn({
                                                checkedIn: !!row.is_checked_in,
                                                disabled: Boolean(state.checkingInAttendantId),
                                             })}
                                          >
                                             <UserCheck size={14} />
                                             {isRowLoading
                                                ? func.translate('manual.checking_in_btn')
                                                : func.translate('manual.check_in_btn')}
                                          </button>
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};
