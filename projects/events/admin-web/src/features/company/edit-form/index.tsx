'use client';

import { Pencil, X } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';
import { StatusBadge } from '@admin-web/components/status-badge';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CompanyEditForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { className } = properties;

   const { state, param, func } = useLogic(properties);
   const { root, modal } = useStyle;

   return (
      <>
         <button
            type="button"
            className={root.wrapper({ className })}
            onClick={() => func.toggleModal(true)}
         >
            <Pencil size={18} />
         </button>
         <div
            className={modal.wrapper({ isOpen: state.isModalOpen })}
            role="dialog"
            aria-modal="true"
         >
            <form
               className={modal.panel}
               onSubmit={func.onSubmit}
            >
               <div className={modal.header.wrapper}>
                  <h3
                     id="update-company-modal-title"
                     className={modal.header.title}
                  >
                     {func.translate('title')}
                     <StatusBadge status={param.company.status ?? 'SUSPENDED'} />
                  </h3>
                  <button
                     type="button"
                     aria-label="Close modal"
                     onClick={() => func.toggleModal(false)}
                     className={modal.header.close_button}
                  >
                     <X className={modal.header.close_icon} />
                  </button>
               </div>

               <div className={modal.body.wrapper}>
                  <FormField
                     id="company-name"
                     label={func.translate('fields.name.label')}
                     required
                     error={param.errors.name?.message}
                  >
                     <input
                        id="company-name"
                        type="text"
                        placeholder={func.translate('fields.name.placeholder')}
                        {...func.register('name')}
                     />
                  </FormField>
                  <FormField
                     id="company-tax-code"
                     label={func.translate('fields.tax_code.label')}
                     error={param.errors.tax_code?.message}
                  >
                     <input
                        id="company-tax-code"
                        type="text"
                        placeholder={func.translate('fields.tax_code.placeholder')}
                        {...func.register('tax_code')}
                     />
                  </FormField>
                  <FormField
                     id="company-industry"
                     label={func.translate('fields.industry.label')}
                     error={param.errors.industry?.message}
                  >
                     <input
                        id="company-industry"
                        type="text"
                        placeholder={func.translate('fields.industry.placeholder')}
                        {...func.register('industry')}
                     />
                  </FormField>
                  <FormField
                     id="company-contact-person"
                     label={func.translate('fields.contact_person.label')}
                     error={param.errors.contact_person?.message}
                  >
                     <input
                        id="company-contact-person"
                        type="text"
                        placeholder={func.translate('fields.contact_person.placeholder')}
                        {...func.register('contact_person')}
                     />
                  </FormField>
                  <FormField
                     id="company-contact-email"
                     label={func.translate('fields.contact_email.label')}
                     error={param.errors.contact_email?.message}
                  >
                     <input
                        id="company-contact-email"
                        type="email"
                        placeholder={func.translate('fields.contact_email.placeholder')}
                        {...func.register('contact_email')}
                     />
                  </FormField>
                  <FormField
                     id="company-contact-phone"
                     label={func.translate('fields.contact_phone.label')}
                     error={param.errors.contact_phone?.message}
                  >
                     <input
                        id="company-contact-phone"
                        type="tel"
                        placeholder={func.translate('fields.contact_phone.placeholder')}
                        {...func.register('contact_phone')}
                     />
                  </FormField>
                  <FormField
                     id="company-logo-url"
                     label={func.translate('fields.logo_url.label')}
                     error={param.errors.logo_url?.message}
                  >
                     <input
                        id="company-logo-url"
                        type="url"
                        placeholder={func.translate('fields.logo_url.placeholder')}
                        {...func.register('logo_url')}
                     />
                  </FormField>
                  <FormField
                     id="company-address"
                     label={func.translate('fields.address.label')}
                     error={param.errors.address?.message}
                  >
                     <input
                        id="company-address"
                        type="text"
                        placeholder={func.translate('fields.address.placeholder')}
                        {...func.register('address')}
                     />
                  </FormField>
               </div>

               <div className={modal.footer.wrapper}>
                  <button
                     type="button"
                     onClick={() => func.toggleModal(false)}
                     className={modal.footer.cancel_button}
                  >
                     {func.translate('actions.cancel')}
                  </button>
                  <button
                     type="submit"
                     disabled={param.isDisabled}
                     className={modal.footer.save_button({ disabled: param.isDisabled })}
                  >
                     {func.translate(`actions.saving_${param.isPending}`)}
                  </button>
               </div>
            </form>
         </div>
      </>
   );
};
