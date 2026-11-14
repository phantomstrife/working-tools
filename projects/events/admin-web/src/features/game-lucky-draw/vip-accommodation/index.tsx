'use client';

import { AlertCircle, CheckCircle2, CreditCard, Loader2, Mail, PencilLine, Phone, User } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const VipAccommodation: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { root, status, event_meta, summary_card, form, actions } = useStyle;

   const eventLabel = [param.attendant?.eventName, param.attendant?.gameName].filter(Boolean).join(' • ');

   return (
      <div className={root.wrapper}>
         {param.mode === 'loading' && (
            <div className={status.wrapper}>
               <div className={status.icon_box({ tone: 'loading' })}>
                  <Loader2
                     size={28}
                     className={status.spinner}
                  />
               </div>
               <p className={status.description}>
                  {param.initialAction === 'edit'
                     ? func.translate('loading.loading_info')
                     : func.translate('loading.confirming')}
               </p>
            </div>
         )}

         {param.mode === 'error' && (
            <div className={status.wrapper}>
               <div className={status.icon_box({ tone: 'error' })}>
                  <AlertCircle size={28} />
               </div>
               <h1 className={status.title}>{func.translate('error.title')}</h1>
               <p className={status.description}>{param.errorMessage || func.translate('error.fallback')}</p>
            </div>
         )}

         {param.mode === 'confirmed' && param.attendant && (
            <>
               <div className={status.wrapper}>
                  <div className={status.icon_box({ tone: 'success' })}>
                     <CheckCircle2 size={28} />
                  </div>
                  <h1 className={status.title}>
                     {param.wasUpdated ? func.translate('confirmed.updated_title') : func.translate('confirmed.title')}
                  </h1>
                  <p className={status.description}>
                     {param.wasUpdated
                        ? func.translate('confirmed.updated_description')
                        : func.translate('confirmed.description')}
                  </p>
                  <div className={event_meta.wrapper}>
                     {eventLabel && <span className={event_meta.event_pill}>{eventLabel}</span>}
                     <span className={event_meta.ticket_pill}>
                        {func.translate('ticket_label', { code: param.attendant.ticket_code })}
                     </span>
                  </div>
               </div>

               <div className={summary_card.wrapper}>
                  <h2 className={summary_card.heading}>{func.translate('summary.title')}</h2>
                  <div className={summary_card.list}>
                     <div className={summary_card.row}>
                        <span className={summary_card.label}>{func.translate('summary.full_name')}</span>
                        <span className={summary_card.value}>{param.attendant.full_name}</span>
                     </div>
                     <div className={summary_card.row}>
                        <span className={summary_card.label}>{func.translate('summary.citizen_id')}</span>
                        <span className={summary_card.value}>{param.attendant.citizen_id || '—'}</span>
                     </div>
                     <div className={summary_card.row}>
                        <span className={summary_card.label}>{func.translate('summary.email')}</span>
                        <span className={summary_card.value}>{param.attendant.email || '—'}</span>
                     </div>
                     <div className={summary_card.row}>
                        <span className={summary_card.label}>{func.translate('summary.phone')}</span>
                        <span className={summary_card.value}>{param.attendant.phone || '—'}</span>
                     </div>
                  </div>
               </div>

               <div className={actions.confirm_footer}>
                  {param.attendant.isEditExpired ? (
                     <p className={actions.expired_notice}>{func.translate('confirmed.edit_expired_notice')}</p>
                  ) : (
                     <button
                        type="button"
                        onClick={func.handleSwitchToEdit}
                        className={actions.secondary_btn}
                     >
                        <PencilLine size={16} />
                        <span>{func.translate('confirmed.edit_button')}</span>
                     </button>
                  )}
               </div>
            </>
         )}

         {param.mode === 'edit' && param.attendant && (
            <>
               <div className={form.header}>
                  <div className={status.icon_box({ tone: 'edit' })}>
                     <PencilLine size={24} />
                  </div>
                  <h1 className={status.title}>{func.translate('edit.title')}</h1>
                  <p className={status.description}>{func.translate('edit.description')}</p>
                  <div className={event_meta.wrapper}>
                     {eventLabel && <span className={event_meta.event_pill}>{eventLabel}</span>}
                     <span className={event_meta.ticket_pill}>
                        {func.translate('ticket_label', { code: param.attendant.ticket_code })}
                     </span>
                  </div>
               </div>

               <form
                  className={form.wrapper}
                  onSubmit={func.onSubmit}
               >
                  <div className={form.fields}>
                     <FormField
                        id="vip-full-name"
                        Icon={User}
                        label={func.translate('edit.fields.full_name.label')}
                        required
                        error={param.errors.full_name?.message}
                     >
                        <input
                           id="vip-full-name"
                           type="text"
                           placeholder={func.translate('edit.fields.full_name.placeholder')}
                           disabled={param.isPending}
                           {...func.register('full_name')}
                        />
                     </FormField>

                     <FormField
                        id="vip-citizen-id"
                        Icon={CreditCard}
                        label={func.translate('edit.fields.citizen_id.label')}
                        error={param.errors.citizen_id?.message}
                     >
                        <input
                           id="vip-citizen-id"
                           type="text"
                           placeholder={func.translate('edit.fields.citizen_id.placeholder')}
                           disabled={param.isPending}
                           {...func.register('citizen_id')}
                        />
                     </FormField>

                     <FormField
                        id="vip-email"
                        Icon={Mail}
                        label={func.translate('edit.fields.email.label')}
                        error={param.errors.email?.message}
                     >
                        <input
                           id="vip-email"
                           type="email"
                           placeholder={func.translate('edit.fields.email.placeholder')}
                           disabled={param.isPending}
                           {...func.register('email')}
                        />
                     </FormField>

                     <FormField
                        id="vip-phone"
                        Icon={Phone}
                        label={func.translate('edit.fields.phone.label')}
                        error={param.errors.phone?.message}
                     >
                        <input
                           id="vip-phone"
                           type="tel"
                           placeholder={func.translate('edit.fields.phone.placeholder')}
                           disabled={param.isPending}
                           {...func.register('phone')}
                        />
                     </FormField>
                  </div>

                  {param.submitError && (
                     <p
                        className={form.error_banner}
                        role="alert"
                     >
                        {param.submitError}
                     </p>
                  )}

                  <div className={form.footer}>
                     {param.canCancelEdit && (
                        <button
                           type="button"
                           onClick={func.handleCancelEdit}
                           disabled={param.isPending}
                           className={actions.secondary_btn}
                        >
                           {func.translate('edit.actions.cancel')}
                        </button>
                     )}
                     <button
                        type="submit"
                        disabled={param.isSubmitDisabled}
                        className={actions.primary_btn({ disabled: param.isSubmitDisabled })}
                     >
                        {func.translate(`edit.actions.saving_${param.isPending}`)}
                     </button>
                  </div>
               </form>
            </>
         )}
      </div>
   );
};
