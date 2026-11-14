'use client';

import { useRef } from 'react';
import {
   AlertTriangle,
   Camera,
   CameraOff,
   CheckCircle2,
   Clock,
   Keyboard,
   Pencil,
   QrCode,
   RefreshCw,
   RotateCcw,
   Search,
   User,
   UserCheck,
   Users,
   X,
   XCircle,
} from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';
import { Modal } from '@admin-web/components/modal';

import { MODAL_ID } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const GuardCheckIn: AdminWeb.Component<Types.Properties> = (properties) => {
   const scannerInputRef = useRef<HTMLInputElement>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const { state, param, func } = useLogic(properties, scannerInputRef, videoRef, canvasRef);
   const { root, stats, card, qr, feedback, manual, edit_modal } = useStyle;

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
         <div className="flex items-center justify-end">
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
                                 readOnly={state.isQrSubmitting}
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
                              {state.isQrSubmitting && <RefreshCw className={stats.refresh_icon({ loading: true })} />}
                              {func.translate(`qr.submit_scanning_${state.isQrSubmitting}`)}
                           </button>
                        </div>
                        <span className={qr.hint}>{func.translate('qr.scanner_hint')}</span>
                     </form>
                  ) : (
                     <div className={qr.camera.wrapper}>
                        <div className={qr.camera.viewport({ status: param.cameraStatus })}>
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
                              <>
                                 <div className={qr.camera.overlay({ status: param.cameraStatus })} />
                                 <div className={qr.camera.hud({ status: param.cameraStatus })}>
                                    {param.cameraStatus === 'VERIFYING' ? (
                                       <div className={qr.camera.hud_left}>
                                          <RefreshCw className={stats.refresh_icon({ loading: true })} />
                                          <span className={qr.camera.hud_text}>
                                             {func.translate('qr.status_verifying')}
                                          </span>
                                       </div>
                                    ) : param.cameraStatus === 'PREVIEW' && state.lastResult?.kind === 'PREVIEW' ? (
                                       <>
                                          <div className={qr.camera.hud_left}>
                                             <UserCheck className={qr.camera.hud_icon} />
                                             <span className={qr.camera.hud_text}>
                                                {state.lastResult.attendant.full_name}
                                             </span>
                                          </div>
                                          <span className={qr.camera.hud_ticket}>
                                             {state.lastResult.attendant.ticket_code}
                                          </span>
                                       </>
                                    ) : param.cameraStatus === 'SUCCESS' && state.lastResult?.kind === 'SUCCESS' ? (
                                       <>
                                          <div className={qr.camera.hud_left}>
                                             <CheckCircle2 className={qr.camera.hud_icon} />
                                             <span className={qr.camera.hud_text}>
                                                {state.lastResult.attendant.full_name}
                                             </span>
                                          </div>
                                          <span className={qr.camera.hud_ticket}>
                                             {state.lastResult.attendant.ticket_code}
                                          </span>
                                       </>
                                    ) : param.cameraStatus === 'ALREADY' && state.lastResult?.kind === 'ALREADY' ? (
                                       <>
                                          <div className={qr.camera.hud_left}>
                                             <AlertTriangle className={qr.camera.hud_icon} />
                                             <span className={qr.camera.hud_text}>
                                                {state.lastResult.attendant.full_name}
                                             </span>
                                          </div>
                                          <span className={qr.camera.hud_ticket}>
                                             {state.lastResult.attendant.ticket_code}
                                          </span>
                                       </>
                                    ) : param.cameraStatus === 'ERROR' && state.lastResult?.kind === 'ERROR' ? (
                                       <div className={qr.camera.hud_left}>
                                          <XCircle className={qr.camera.hud_icon} />
                                          <span className={qr.camera.hud_text}>{state.lastResult.message}</span>
                                       </div>
                                    ) : (
                                       <div className={qr.camera.hud_left}>
                                          <QrCode className={qr.camera.hud_icon} />
                                          <span className={qr.camera.hud_text}>
                                             {func.translate('qr.status_ready')}
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              </>
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
                           <div className={qr.camera.controls_actions}>
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
                     </div>
                  )}
               </div>

               <div className={card.wrapper}>
                  <div className={card.header}>
                     <div className={card.title_row}>
                        <h3 className={card.title}>{func.translate('feedback.title')}</h3>
                        {param.canResetScan && (
                           <button
                              type="button"
                              onClick={func.handleResetScan}
                              className={qr.reset_button}
                           >
                              <RotateCcw size={14} />
                              {func.translate('qr.reset_scan')}
                           </button>
                        )}
                     </div>
                  </div>

                  {state.isQrSubmitting ? (
                     <div className={feedback.verifying_banner}>
                        <div className={feedback.verifying_icon_box}>
                           <RefreshCw className={stats.refresh_icon({ loading: true })} />
                        </div>
                        <div className={feedback.verifying_content}>
                           <span className={feedback.verifying_title}>
                              {func.translate('feedback.verifying_title')}
                           </span>
                           <span className={feedback.verifying_description}>
                              {func.translate('feedback.verifying_description')}
                           </span>
                        </div>
                     </div>
                  ) : !state.lastResult ? (
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
                              {state.lastResult.kind === 'PREVIEW' ? (
                                 <UserCheck size={14} />
                              ) : state.lastResult.kind === 'SUCCESS' ? (
                                 <CheckCircle2 size={14} />
                              ) : (
                                 <AlertTriangle size={14} />
                              )}
                              {state.lastResult.kind === 'PREVIEW'
                                 ? func.translate('feedback.preview_title')
                                 : state.lastResult.kind === 'SUCCESS'
                                   ? func.translate('feedback.success_title')
                                   : func.translate('feedback.already_title')}
                           </span>
                           {state.lastResult.attendant.checked_in_at && (
                              <span className={feedback.recent.time}>
                                 {formatDateTime(state.lastResult.attendant.checked_in_at ?? state.lastResult.at)}
                              </span>
                           )}
                        </div>

                        <span className={feedback.name}>
                           {state.lastResult.attendant.full_name}
                           <span className={feedback.ticket_code}>{state.lastResult.attendant.ticket_code}</span>
                        </span>

                        <div className={feedback.meta_grid}>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.company_label')}</span>
                              <span className={feedback.meta_value}>{state.lastResult.attendant.company_name}</span>
                           </div>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.contact_phone')}</span>
                              <span className={feedback.meta_value}>{state.lastResult.attendant.phone}</span>
                           </div>
                           <div className={feedback.meta_item}>
                              <span className={feedback.meta_label}>{func.translate('feedback.contact_email')}</span>
                              <span className={feedback.meta_value}>{state.lastResult.attendant.email}</span>
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

                        <div className={feedback.inline_rep_box}>
                           <label
                              htmlFor="guard-inline-representative"
                              className={feedback.inline_rep_label}
                           >
                              {func.translate('feedback.representative_label')}
                           </label>
                           <div className={feedback.inline_rep_row}>
                              <div className={feedback.inline_rep_input_wrapper}>
                                 <User size={15} />
                                 <input
                                    id="guard-inline-representative"
                                    type="text"
                                    value={state.previewRepresentativeInput}
                                    placeholder={func.translate('feedback.representative_placeholder')}
                                    onChange={(event) =>
                                       func.setState(event.target.value, 'previewRepresentativeInput')
                                    }
                                    className={feedback.inline_rep_input}
                                 />
                              </div>
                              {state.lastResult.kind !== 'PREVIEW' && (
                                 <button
                                    type="button"
                                    disabled={param.isSaveInlineRepresentativeDisabled}
                                    onClick={func.handleSaveInlineRepresentative}
                                    className={feedback.inline_action_btn({
                                       tone: 'primary',
                                       disabled: param.isSaveInlineRepresentativeDisabled,
                                    })}
                                 >
                                    {state.isSavingInlineRepresentative
                                       ? func.translate('feedback.saving_representative_btn')
                                       : func.translate('feedback.save_representative_btn')}
                                 </button>
                              )}
                           </div>
                        </div>

                        {state.lastResult.kind === 'PREVIEW' && (
                           <div className={feedback.inline_actions}>
                              <button
                                 type="button"
                                 disabled={state.isConfirmingCheckIn}
                                 onClick={func.handleConfirmQrCheckIn}
                                 className={feedback.inline_action_btn({
                                    tone: 'primary',
                                    disabled: state.isConfirmingCheckIn,
                                 })}
                              >
                                 <UserCheck size={15} />
                                 {state.isConfirmingCheckIn
                                    ? func.translate('feedback.confirming_btn')
                                    : func.translate('feedback.confirm_btn')}
                              </button>
                              <button
                                 type="button"
                                 disabled={state.isConfirmingCheckIn}
                                 onClick={func.handleResetScan}
                                 className={feedback.inline_action_btn({
                                    tone: 'secondary',
                                    disabled: state.isConfirmingCheckIn,
                                 })}
                              >
                                 {func.translate('feedback.cancel_btn')}
                              </button>
                           </div>
                        )}
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
                                    <span className={feedback.recent.name}>
                                       {entry.attendant.representative || entry.attendant.full_name}
                                    </span>
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
                                 <th className={manual.th}>{func.translate('manual.columns.representative')}</th>
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
                                          {row.representative ? (
                                             <span className={manual.representative_text}>{row.representative}</span>
                                          ) : (
                                             <span className={manual.representative_empty}>—</span>
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
                                          <div className={manual.action_group}>
                                             <button
                                                type="button"
                                                title={func.translate('manual.edit_representative_title')}
                                                onClick={() => func.handleOpenEditRepresentative(row)}
                                                className={manual.edit_btn}
                                             >
                                                <Pencil size={13} />
                                                {func.translate('manual.edit_btn')}
                                             </button>
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
                                          </div>
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

         <Modal
            id={MODAL_ID.EDIT_REPRESENTATIVE}
            title={func.translate('edit_modal.title')}
            description={func.translate('edit_modal.description')}
            style={{ width: '32rem', bodyClass: 'p-0' }}
         >
            {() => (
               <form
                  className={edit_modal.form}
                  onSubmit={func.handleSaveRepresentative}
               >
                  <div className={edit_modal.body}>
                     {state.editingAttendant && (
                        <div className={edit_modal.summary}>
                           <div className={edit_modal.summary_top}>
                              <span className={edit_modal.summary_name}>{state.editingAttendant.full_name}</span>
                              <span className={edit_modal.summary_ticket}>{state.editingAttendant.ticket_code}</span>
                           </div>
                           {(state.editingAttendant.company_name || state.editingAttendant.department) && (
                              <span className={edit_modal.summary_company}>
                                 {[state.editingAttendant.company_name, state.editingAttendant.department]
                                    .filter(Boolean)
                                    .join(' • ')}
                              </span>
                           )}
                        </div>
                     )}

                     <FormField
                        id="guard-edit-representative"
                        Icon={User}
                        label={func.translate('edit_modal.field_label')}
                     >
                        <input
                           id="guard-edit-representative"
                           type="text"
                           autoFocus
                           value={state.representativeInput}
                           placeholder={func.translate('edit_modal.field_placeholder')}
                           onChange={(event) => func.setState(event.target.value, 'representativeInput')}
                        />
                     </FormField>
                  </div>

                  <div className={edit_modal.footer.wrapper}>
                     <button
                        type="button"
                        onClick={func.handleCloseEditRepresentative}
                        className={edit_modal.footer.cancel_button}
                     >
                        {func.translate('edit_modal.cancel_btn')}
                     </button>
                     <button
                        type="submit"
                        disabled={param.isSaveRepresentativeDisabled}
                        className={edit_modal.footer.submit_button({
                           disabled: param.isSaveRepresentativeDisabled,
                        })}
                     >
                        {state.isSavingRepresentative
                           ? func.translate('edit_modal.saving_btn')
                           : func.translate('edit_modal.save_btn')}
                     </button>
                  </div>
               </form>
            )}
         </Modal>
      </div>
   );
};
