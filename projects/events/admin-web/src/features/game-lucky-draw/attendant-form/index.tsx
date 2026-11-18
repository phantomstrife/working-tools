'use client';

import {
   ArrowRight,
   BedDouble,
   Building2,
   Clock,
   CreditCard,
   FileText,
   Hash,
   History,
   Loader2,
   Mail,
   Phone,
   RefreshCw,
   User,
   Users,
} from 'lucide-react';

import { CopyButton } from '@admin-web/components/copy-button';
import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const AttendantForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, tabs, checkbox_field, qr_box, history, footer } = useStyle;

   const formatDateTime = (iso: string | null) => {
      if (!iso) {
         return '—';
      }

      return new Date(iso).toLocaleString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
      });
   };

   const resolveFieldLabel = (field: string) => {
      const knownFields = [
         'full_name',
         'citizen_id',
         'email',
         'phone',
         'representative',
         'representative_phone',
      ];

      return knownFields.includes(field) ? func.translate(`history.fields.${field}`) : field;
   };

   return (
      <div>
         {param.mode === 'edit' && (
            <div className={tabs.wrapper}>
               <button
                  type="button"
                  onClick={() => func.handleSelectTab('info')}
                  className={tabs.button({ active: param.activeTab === 'info' })}
               >
                  <FileText size={14} />
                  <span>{func.translate('tabs.info')}</span>
               </button>
               <button
                  type="button"
                  onClick={() => func.handleSelectTab('history')}
                  className={tabs.button({ active: param.activeTab === 'history' })}
               >
                  <History size={14} />
                  <span>{func.translate('tabs.history')}</span>
                  {param.hasLoadedHistory && (
                     <span className={tabs.count_badge}>{param.historyEntries.length}</span>
                  )}
               </button>
            </div>
         )}

         {param.activeTab === 'info' ? (
            <form
               className={form}
               onSubmit={func.onSubmit}
            >
               <div className={grid}>
                  <FormField
                     id="attendant-full-name"
                     Icon={User}
                     label={func.translate('fields.full_name.label')}
                     required
                     error={param.errors.full_name?.message}
                  >
                     <input
                        id="attendant-full-name"
                        type="text"
                        placeholder={func.translate('fields.full_name.placeholder')}
                        {...func.register('full_name')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-citizen-id"
                     Icon={CreditCard}
                     label={func.translate('fields.citizen_id.label')}
                     error={param.errors.citizen_id?.message}
                  >
                     <input
                        id="attendant-citizen-id"
                        type="text"
                        placeholder={func.translate('fields.citizen_id.placeholder')}
                        {...func.register('citizen_id')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-ticket-code"
                     Icon={Hash}
                     label={func.translate('fields.ticket_code.label')}
                     required
                     error={param.errors.ticket_code?.message}
                  >
                     <input
                        id="attendant-ticket-code"
                        type="text"
                        placeholder={func.translate('fields.ticket_code.placeholder')}
                        {...func.register('ticket_code')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-email"
                     Icon={Mail}
                     label={func.translate('fields.email.label')}
                     error={param.errors.email?.message}
                  >
                     <input
                        id="attendant-email"
                        type="email"
                        placeholder={func.translate('fields.email.placeholder')}
                        {...func.register('email')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-phone"
                     Icon={Phone}
                     label={func.translate('fields.phone.label')}
                     error={param.errors.phone?.message}
                  >
                     <input
                        id="attendant-phone"
                        type="tel"
                        placeholder={func.translate('fields.phone.placeholder')}
                        {...func.register('phone')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-company-name"
                     Icon={Building2}
                     label={func.translate('fields.company_name.label')}
                     error={param.errors.company_name?.message}
                  >
                     <input
                        id="attendant-company-name"
                        type="text"
                        placeholder={func.translate('fields.company_name.placeholder')}
                        {...func.register('company_name')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-department"
                     Icon={Users}
                     label={func.translate('fields.department.label')}
                     error={param.errors.department?.message}
                  >
                     <input
                        id="attendant-department"
                        type="text"
                        placeholder={func.translate('fields.department.placeholder')}
                        {...func.register('department')}
                     />
                  </FormField>

                  <FormField
                     id="attendant-sale-in-charge"
                     Icon={User}
                     label={func.translate('fields.sale_in_charge.label')}
                     error={param.errors.sale_in_charge?.message}
                  >
                     <input
                        id="attendant-sale-in-charge"
                        type="text"
                        placeholder={func.translate('fields.sale_in_charge.placeholder')}
                        {...func.register('sale_in_charge')}
                     />
                  </FormField>

                  <div className={checkbox_field.wrapper}>
                     <div className={checkbox_field.title_row}>
                        <BedDouble
                           size={15}
                           className={checkbox_field.title_icon}
                        />
                        <span>{func.translate('fields.accommodation.label')}</span>
                     </div>
                     <label
                        htmlFor="attendant-accommodation"
                        className={checkbox_field.control}
                     >
                        <input
                           id="attendant-accommodation"
                           type="checkbox"
                           className={checkbox_field.input}
                           {...func.register('accommodation')}
                        />
                        <span className={checkbox_field.label}>
                           {func.translate('fields.accommodation.checkbox_label')}
                        </span>
                     </label>
                  </div>
               </div>

               {param.mode === 'edit' && param.attendant?.qr_code_payload && (
                  <div className={qr_box.wrapper}>
                     <div className={qr_box.info}>
                        <span className={qr_box.label}>{func.translate('fields.qr_code_payload.label')}</span>
                        <span className={qr_box.value}>{param.attendant.qr_code_payload}</span>
                     </div>
                     <CopyButton
                        className={qr_box.copy_button}
                        value={param.attendant.qr_code_payload}
                     />
                  </div>
               )}

               <div className={footer.wrapper}>
                  {func.onCancel && (
                     <button
                        type="button"
                        disabled={param.isPending}
                        className={footer.cancel_button}
                        onClick={func.onCancel}
                     >
                        {func.translate('actions.cancel')}
                     </button>
                  )}
                  <button
                     type="submit"
                     disabled={param.isSubmitDisabled}
                     className={footer.submit_button({ disabled: param.isSubmitDisabled })}
                  >
                     {func.translate(`actions.${param.mode}_saving_${param.isPending}`)}
                  </button>
               </div>
            </form>
         ) : (
            <div>
               <div className={history.wrapper}>
                  <div className={history.toolbar}>
                     <span className={history.summary}>
                        {func.translate('history.count', { count: param.historyEntries.length })}
                     </span>
                     <button
                        type="button"
                        disabled={param.isHistoryLoading}
                        onClick={() => void func.fetchHistory()}
                        className={history.refresh_btn}
                     >
                        <RefreshCw className={history.refresh_icon({ loading: param.isHistoryLoading })} />
                        <span>{func.translate('history.refresh')}</span>
                     </button>
                  </div>

                  {param.historyError && <div className={history.error}>{param.historyError}</div>}

                  {param.isHistoryLoading ? (
                     <div className={history.empty}>
                        <Loader2
                           size={20}
                           className={history.refresh_icon({ loading: true })}
                        />
                        <span>{func.translate('history.loading')}</span>
                     </div>
                  ) : param.historyEntries.length === 0 ? (
                     <div className={history.empty}>
                        <Clock size={20} />
                        <span>{func.translate('history.empty')}</span>
                     </div>
                  ) : (
                     <div className={history.list}>
                        {param.historyEntries.map((entry) => {
                           const actorDisplay =
                              entry.actorName || entry.actorEmail
                                 ? [entry.actorName, entry.actorEmail ? `(${entry.actorEmail})` : '']
                                      .filter(Boolean)
                                      .join(' ')
                                 : func.translate('history.guest_actor');

                           return (
                              <div
                                 key={entry.id}
                                 className={history.card}
                              >
                                 <div className={history.card_header}>
                                    <div className={history.badge_group}>
                                       <span className={history.action_badge({ action: entry.actionType })}>
                                          {func.translate(`history.actions.${entry.actionType}`)}
                                       </span>
                                       {entry.source && (
                                          <span className={history.source_pill}>
                                             {func.translate(`history.sources.${entry.source}`)}
                                          </span>
                                       )}
                                    </div>
                                    <span className={history.timestamp}>{formatDateTime(entry.createdAt)}</span>
                                 </div>

                                 <div className={history.actor}>
                                    <User size={13} />
                                    <span>{func.translate('history.actor_label')}:</span>
                                    <span className={history.actor_name}>{actorDisplay}</span>
                                 </div>

                                 {entry.actionType === 'ATTENDANT_SELF_SERVICE_CONFIRM' ? (
                                    <div className={history.confirm_note}>
                                       {func.translate('history.confirm_note')}
                                    </div>
                                 ) : (
                                    entry.changes.length > 0 && (
                                       <div className={history.diff_list}>
                                          {entry.changes.map((change) => (
                                             <div
                                                key={`${entry.id}-${change.field}`}
                                                className={history.diff_row}
                                             >
                                                <span className={history.diff_field}>
                                                   {resolveFieldLabel(change.field)}
                                                </span>
                                                <div className={history.diff_values}>
                                                   <span className={history.diff_from}>{change.from || '—'}</span>
                                                   <ArrowRight
                                                      size={12}
                                                      className={history.diff_arrow}
                                                   />
                                                   <span className={history.diff_to}>{change.to || '—'}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    )
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>

               {func.onCancel && (
                  <div className={footer.wrapper}>
                     <button
                        type="button"
                        className={footer.cancel_button}
                        onClick={func.onCancel}
                     >
                        {func.translate('actions.close')}
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
};
