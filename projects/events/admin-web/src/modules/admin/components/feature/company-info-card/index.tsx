'use client';

import { Building2, Hash, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react';

import { FormField, formControlStyle, UpsertErrorBanner } from '@/components/upsert';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { CompanyInfoCardProps } from './use-logic';

export const CompanyInfoCard = (props: CompanyInfoCardProps) => {
   const { company, companies, onSwitchCompany } = props;
   const { param, func } = useLogic(props);
   const {
      card,
      topRow,
      identityGroup,
      logoBox,
      logoImg,
      titleGroup,
      titleRow,
      companyName,
      statusBadge,
      subMetaRow,
      actionsGroup,
      companySwitcher,
      updateBtn,
      detailsGrid,
      detailItem,
      detailLabel,
      detailValue,
      iconSm,
      iconXs,
      iconMd,
      modal,
   } = useStyle;

   const activeStatus = company.status ?? 'ACTIVE';
   const isSaveDisabled = !param.isDirty || param.isPending;

   return (
      <>
         <section className={card()}>
            <div className={topRow()}>
               <div className={identityGroup()}>
                  <div className={logoBox()}>
                     {company.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                           src={company.logo_url}
                           alt={company.name}
                           className={logoImg()}
                        />
                     ) : (
                        <Building2 className={iconMd()} />
                     )}
                  </div>
                  <div className={titleGroup()}>
                     <div className={titleRow()}>
                        <h2 className={companyName()}>{company.name}</h2>
                        <span className={statusBadge({ status: activeStatus })}>{activeStatus}</span>
                     </div>
                     <div className={subMetaRow()}>
                        <span>Industry: {company.industry || 'Not specified'}</span>
                        <span>•</span>
                        <span>Tax Code: {company.tax_code || 'Not specified'}</span>
                     </div>
                  </div>
               </div>

               <div className={actionsGroup()}>
                  {param.isSuperAdmin && companies.length > 1 && (
                     <select
                        aria-label="Switch company"
                        value={company.id}
                        onChange={(e) => onSwitchCompany(e.target.value)}
                        className={companySwitcher()}
                     >
                        {companies.map((item) => (
                           <option
                              key={item.id}
                              value={item.id}
                           >
                              Company: {item.name}
                           </option>
                        ))}
                     </select>
                  )}

                  <button
                     type="button"
                     onClick={func.handleOpenModal}
                     className={updateBtn()}
                  >
                     <Pencil className={iconSm()} />
                     <span>Update</span>
                  </button>
               </div>
            </div>

            <div className={detailsGrid()}>
               <div className={detailItem()}>
                  <span className={detailLabel()}>
                     <User className={iconXs()} />
                     <span>Contact Person</span>
                  </span>
                  <span className={detailValue()} title={company.contact_person ?? ''}>
                     {company.contact_person || '—'}
                  </span>
               </div>

               <div className={detailItem()}>
                  <span className={detailLabel()}>
                     <Mail className={iconXs()} />
                     <span>Contact Email</span>
                  </span>
                  <span className={detailValue()} title={company.contact_email ?? ''}>
                     {company.contact_email || '—'}
                  </span>
               </div>

               <div className={detailItem()}>
                  <span className={detailLabel()}>
                     <Phone className={iconXs()} />
                     <span>Contact Phone</span>
                  </span>
                  <span className={detailValue()} title={company.contact_phone ?? ''}>
                     {company.contact_phone || '—'}
                  </span>
               </div>

               <div className={detailItem()}>
                  <span className={detailLabel()}>
                     <MapPin className={iconXs()} />
                     <span>Address</span>
                  </span>
                  <span className={detailValue()} title={company.address ?? ''}>
                     {company.address || '—'}
                  </span>
               </div>
            </div>
         </section>

         {param.isModalOpen && (
            <div
               className={modal.backdrop()}
               role="dialog"
               aria-modal="true"
               aria-labelledby="update-company-modal-title"
            >
               <form
                  className={modal.panel()}
                  onSubmit={func.onSubmit}
                  noValidate
               >
                  <div className={modal.header()}>
                     <h3
                        id="update-company-modal-title"
                        className={modal.headerTitle()}
                     >
                        Update Company Profile
                     </h3>
                     <button
                        type="button"
                        aria-label="Close modal"
                        onClick={func.handleCloseModal}
                        className={modal.closeBtn()}
                     >
                        <X className={iconSm()} />
                     </button>
                  </div>

                  <div className={modal.body()}>
                     {param.errors.root?.message && (
                        <FormField
                           id="root-error"
                           label=""
                           fullSpan
                        >
                           <UpsertErrorBanner message={param.errors.root.message} />
                        </FormField>
                     )}

                     <FormField
                        id="company-name"
                        label="Company Name"
                        required
                        error={param.errors.name?.message}
                     >
                        <input
                           id="company-name"
                           type="text"
                           placeholder="e.g., Acme Corporation"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                           {...func.register('name')}
                        />
                     </FormField>

                     <FormField
                        id="company-tax-code"
                        label="Tax Code"
                        error={param.errors.tax_code?.message}
                     >
                        <input
                           id="company-tax-code"
                           type="text"
                           placeholder="e.g., 0101234567"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.tax_code) })}
                           {...func.register('tax_code')}
                        />
                     </FormField>

                     <FormField
                        id="company-industry"
                        label="Industry"
                        error={param.errors.industry?.message}
                     >
                        <input
                           id="company-industry"
                           type="text"
                           placeholder="e.g., Technology / Finance"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.industry) })}
                           {...func.register('industry')}
                        />
                     </FormField>

                     <FormField
                        id="company-status"
                        label="Company Status"
                        error={param.errors.status?.message}
                     >
                        {param.isSuperAdmin ? (
                           <select
                              id="company-status"
                              className={formControlStyle.select({ hasError: Boolean(param.errors.status) })}
                              {...func.register('status')}
                           >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                              <option value="SUSPENDED">SUSPENDED</option>
                           </select>
                        ) : (
                           <div className={modal.readOnlyStatusBox()}>
                              <span className={detailLabel()}>
                                 <Hash className={iconXs()} />
                                 <span>Managed by System Admin</span>
                              </span>
                              <span className={statusBadge({ status: activeStatus })}>{activeStatus}</span>
                           </div>
                        )}
                     </FormField>

                     <FormField
                        id="company-contact-person"
                        label="Contact Person"
                        error={param.errors.contact_person?.message}
                     >
                        <input
                           id="company-contact-person"
                           type="text"
                           placeholder="Full name"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.contact_person) })}
                           {...func.register('contact_person')}
                        />
                     </FormField>

                     <FormField
                        id="company-contact-email"
                        label="Contact Email"
                        error={param.errors.contact_email?.message}
                     >
                        <input
                           id="company-contact-email"
                           type="email"
                           placeholder="contact@company.com"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.contact_email) })}
                           {...func.register('contact_email')}
                        />
                     </FormField>

                     <FormField
                        id="company-contact-phone"
                        label="Contact Phone"
                        error={param.errors.contact_phone?.message}
                     >
                        <input
                           id="company-contact-phone"
                           type="tel"
                           placeholder="+84 90 123 4567"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.contact_phone) })}
                           {...func.register('contact_phone')}
                        />
                     </FormField>

                     <FormField
                        id="company-logo-url"
                        label="Logo URL"
                        error={param.errors.logo_url?.message}
                     >
                        <input
                           id="company-logo-url"
                           type="url"
                           placeholder="https://example.com/logo.webp"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.logo_url) })}
                           {...func.register('logo_url')}
                        />
                     </FormField>

                     <FormField
                        id="company-address"
                        label="Company Address"
                        fullSpan
                        error={param.errors.address?.message}
                     >
                        <input
                           id="company-address"
                           type="text"
                           placeholder="Street address, building, city..."
                           className={formControlStyle.input({ hasError: Boolean(param.errors.address) })}
                           {...func.register('address')}
                        />
                     </FormField>
                  </div>

                  <div className={modal.footer()}>
                     <button
                        type="button"
                        onClick={func.handleCloseModal}
                        className={modal.cancelBtn()}
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={isSaveDisabled}
                        className={modal.saveBtn({ disabled: isSaveDisabled })}
                     >
                        {param.isPending ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               </form>
            </div>
         )}
      </>
   );
};

