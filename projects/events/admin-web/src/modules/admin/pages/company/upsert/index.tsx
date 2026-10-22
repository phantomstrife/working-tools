'use client';

import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Toaster } from 'sonner';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAdminCompanyUpsert: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, stickyBar, skeletonBlock, errorBanner, cardBlock, fieldBlock, auditBlock, icon } = useStyle;

   if (param.isLoadingInitial) {
      return (
         <div className={skeletonBlock.wrapper()}>
            <div className={skeletonBlock.bar()} />
            <div className={skeletonBlock.card()} />
            <div className={skeletonBlock.card()} />
         </div>
      );
   }

   return (
      <form
         className={wrapper()}
         onSubmit={func.onSubmit}
         noValidate
      >
         <Toaster position="top-right" />

         <div className={stickyBar.wrapper()}>
            <div className={stickyBar.leftGroup()}>
               <button
                  type="button"
                  onClick={func.handleCancel}
                  className={stickyBar.backBtn()}
                  aria-label="Back to companies"
               >
                  <ArrowLeft className={icon.sm()} />
               </button>
               <div className={stickyBar.titleGroup()}>
                  <h1 className={stickyBar.title()}>{param.isEdit ? 'Edit Company' : 'Create Company'}</h1>
                  <span className={stickyBar.subtitle()}>
                     {param.isEdit
                        ? 'Update company profile, primary contact, and tenant status.'
                        : 'Register a new tenant organization in the platform.'}
                  </span>
               </div>
            </div>

            <div className={stickyBar.actions()}>
               {param.isDirty && <span className={stickyBar.dirtyBadge()}>Unsaved changes</span>}
               <button
                  type="button"
                  onClick={func.handleCancel}
                  className={stickyBar.cancelBtn()}
               >
                  Cancel
               </button>
               <button
                  type="submit"
                  disabled={!param.isDirty || param.isPending}
                  className={stickyBar.saveBtn({ disabled: !param.isDirty || param.isPending })}
               >
                  {param.isPending ? <Loader2 className={icon.spin()} /> : <Save className={icon.sm()} />}
                  {param.isPending ? 'Saving...' : param.isEdit ? 'Save Changes' : 'Create Company'}
               </button>
            </div>
         </div>

         {param.loadError && (
            <div
               className={errorBanner.wrapper()}
               role="alert"
            >
               <span>{param.loadError}</span>
            </div>
         )}

         {param.errors.root?.message && (
            <div
               className={errorBanner.wrapper()}
               role="alert"
            >
               <span>{param.errors.root.message}</span>
            </div>
         )}

         <section className={cardBlock.wrapper()}>
            <div className={cardBlock.header()}>
               <h2 className={cardBlock.title()}>Overview & Identity</h2>
               <span className={cardBlock.description()}>
                  Core legal identity, industry classification, and headquarters address.
               </span>
            </div>

            <div className={cardBlock.grid()}>
               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="name"
                     className={fieldBlock.label()}
                  >
                     Company Name
                     <span className={fieldBlock.requiredMark()}>*</span>
                  </label>
                  <input
                     id="name"
                     type="text"
                     placeholder="e.g., Acme Corporation"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.name) })}
                     {...func.register('name')}
                  />
                  {param.errors.name && <span className={fieldBlock.error()}>{param.errors.name.message}</span>}
               </div>

               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="tax_code"
                     className={fieldBlock.label()}
                  >
                     Tax Code
                  </label>
                  <input
                     id="tax_code"
                     type="text"
                     placeholder="e.g., 0101234567"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.tax_code) })}
                     {...func.register('tax_code')}
                  />
                  {param.errors.tax_code && <span className={fieldBlock.error()}>{param.errors.tax_code.message}</span>}
               </div>

               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="industry"
                     className={fieldBlock.label()}
                  >
                     Industry
                  </label>
                  <input
                     id="industry"
                     type="text"
                     placeholder="e.g., Technology, Finance, Retail"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.industry) })}
                     {...func.register('industry')}
                  />
                  {param.errors.industry && <span className={fieldBlock.error()}>{param.errors.industry.message}</span>}
               </div>

               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="logo_url"
                     className={fieldBlock.label()}
                  >
                     Logo URL
                  </label>
                  <input
                     id="logo_url"
                     type="url"
                     placeholder="https://example.com/logo.png"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.logo_url) })}
                     {...func.register('logo_url')}
                  />
                  {param.errors.logo_url && <span className={fieldBlock.error()}>{param.errors.logo_url.message}</span>}
               </div>

               <div className={cardBlock.fullSpan()}>
                  <div className={fieldBlock.wrapper()}>
                     <label
                        htmlFor="address"
                        className={fieldBlock.label()}
                     >
                        Headquarters Address
                     </label>
                     <input
                        id="address"
                        type="text"
                        placeholder="Street address, district, city"
                        className={fieldBlock.input({ hasError: Boolean(param.errors.address) })}
                        {...func.register('address')}
                     />
                     {param.errors.address && (
                        <span className={fieldBlock.error()}>{param.errors.address.message}</span>
                     )}
                  </div>
               </div>
            </div>
         </section>

         <section className={cardBlock.wrapper()}>
            <div className={cardBlock.header()}>
               <h2 className={cardBlock.title()}>Primary Contact</h2>
               <span className={cardBlock.description()}>
                  Designated representative for event coordination and account notifications.
               </span>
            </div>

            <div className={cardBlock.grid()}>
               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="contact_person"
                     className={fieldBlock.label()}
                  >
                     Contact Person
                  </label>
                  <input
                     id="contact_person"
                     type="text"
                     placeholder="Full name of representative"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.contact_person) })}
                     {...func.register('contact_person')}
                  />
                  {param.errors.contact_person && (
                     <span className={fieldBlock.error()}>{param.errors.contact_person.message}</span>
                  )}
               </div>

               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="contact_phone"
                     className={fieldBlock.label()}
                  >
                     Contact Phone
                  </label>
                  <input
                     id="contact_phone"
                     type="tel"
                     placeholder="e.g., +84 901 234 567"
                     className={fieldBlock.input({ hasError: Boolean(param.errors.contact_phone) })}
                     {...func.register('contact_phone')}
                  />
                  {param.errors.contact_phone && (
                     <span className={fieldBlock.error()}>{param.errors.contact_phone.message}</span>
                  )}
               </div>

               <div className={cardBlock.fullSpan()}>
                  <div className={fieldBlock.wrapper()}>
                     <label
                        htmlFor="contact_email"
                        className={fieldBlock.label()}
                     >
                        Contact Email
                     </label>
                     <input
                        id="contact_email"
                        type="email"
                        placeholder="representative@company.com"
                        className={fieldBlock.input({ hasError: Boolean(param.errors.contact_email) })}
                        {...func.register('contact_email')}
                     />
                     {param.errors.contact_email && (
                        <span className={fieldBlock.error()}>{param.errors.contact_email.message}</span>
                     )}
                  </div>
               </div>
            </div>
         </section>

         <section className={cardBlock.wrapper()}>
            <div className={cardBlock.header()}>
               <h2 className={cardBlock.title()}>Status & Configuration</h2>
               <span className={cardBlock.description()}>
                  Control whether this company and its associated accounts can access live events.
               </span>
            </div>

            <div className={cardBlock.grid()}>
               <div className={fieldBlock.wrapper()}>
                  <label
                     htmlFor="status"
                     className={fieldBlock.label()}
                  >
                     Account Status
                  </label>
                  <select
                     id="status"
                     className={fieldBlock.select({ hasError: Boolean(param.errors.status) })}
                     {...func.register('status')}
                  >
                     <option value="ACTIVE">ACTIVE — Operational access enabled</option>
                     <option value="INACTIVE">INACTIVE — Archived / Not active</option>
                     <option value="SUSPENDED">SUSPENDED — Access temporarily restricted</option>
                  </select>
                  <span className={fieldBlock.hint()}>
                     Suspended companies cannot launch live games or check in attendees.
                  </span>
                  {param.errors.status && <span className={fieldBlock.error()}>{param.errors.status.message}</span>}
               </div>
            </div>
         </section>

         {param.isEdit && param.auditMeta && (
            <section className={auditBlock.wrapper()}>
               <div className={auditBlock.item()}>
                  <span className={auditBlock.label()}>Company ID</span>
                  <span className={auditBlock.value()}>{param.auditMeta.id}</span>
               </div>
               <div className={auditBlock.item()}>
                  <span className={auditBlock.label()}>Created At</span>
                  <span className={auditBlock.value()}>{func.formatTimestamp(param.auditMeta.createdAt)}</span>
               </div>
               <div className={auditBlock.item()}>
                  <span className={auditBlock.label()}>Last Updated At</span>
                  <span className={auditBlock.value()}>{func.formatTimestamp(param.auditMeta.updatedAt)}</span>
               </div>
            </section>
         )}
      </form>
   );
};

