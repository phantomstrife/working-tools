'use client';

import { Building2, Hash, Mail, Phone, User, Users } from 'lucide-react';

import { CopyButton } from '@admin-web/components/copy-button';
import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const AttendantForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, qr_box, footer } = useStyle;

   return (
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
   );
};

