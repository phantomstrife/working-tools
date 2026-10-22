'use client';

import { Toaster } from 'sonner';

import {
   FormField,
   formControlStyle,
   UpsertAuditFooter,
   UpsertErrorBanner,
   UpsertSectionCard,
   UpsertSkeleton,
   UpsertStickyBar,
} from '@/components/upsert';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAdminCompanyUpsert: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={3} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Company ID', value: param.auditMeta.id },
              { label: 'Created At', value: func.formatTimestamp(param.auditMeta.createdAt) },
              { label: 'Last Updated At', value: func.formatTimestamp(param.auditMeta.updatedAt) },
           ]
         : [];

   return (
      <form
         className={wrapper()}
         onSubmit={func.onSubmit}
         noValidate
      >
         <Toaster position="top-right" />

         <UpsertStickyBar
            title={param.isEdit ? 'Edit Company' : 'Create Company'}
            subtitle={
               param.isEdit
                  ? 'Update company profile, primary contact, and tenant status.'
                  : 'Register a new tenant organization in the platform.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Create Company'}
            backAriaLabel="Back to companies"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Overview & Identity"
            description="Core legal identity, industry classification, and headquarters address."
         >
            <FormField
               id="name"
               label="Company Name"
               required
               error={param.errors.name?.message}
            >
               <input
                  id="name"
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="tax_code"
               label="Tax Code"
               error={param.errors.tax_code?.message}
            >
               <input
                  id="tax_code"
                  type="text"
                  placeholder="e.g., 0101234567"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.tax_code) })}
                  {...func.register('tax_code')}
               />
            </FormField>

            <FormField
               id="industry"
               label="Industry"
               error={param.errors.industry?.message}
            >
               <input
                  id="industry"
                  type="text"
                  placeholder="e.g., Technology, Finance, Retail"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.industry) })}
                  {...func.register('industry')}
               />
            </FormField>

            <FormField
               id="logo_url"
               label="Logo URL"
               error={param.errors.logo_url?.message}
            >
               <input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.logo_url) })}
                  {...func.register('logo_url')}
               />
            </FormField>

            <FormField
               id="address"
               label="Headquarters Address"
               fullSpan
               error={param.errors.address?.message}
            >
               <input
                  id="address"
                  type="text"
                  placeholder="Street address, district, city"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.address) })}
                  {...func.register('address')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Primary Contact"
            description="Designated representative for event coordination and account notifications."
         >
            <FormField
               id="contact_person"
               label="Contact Person"
               error={param.errors.contact_person?.message}
            >
               <input
                  id="contact_person"
                  type="text"
                  placeholder="Full name of representative"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.contact_person) })}
                  {...func.register('contact_person')}
               />
            </FormField>

            <FormField
               id="contact_phone"
               label="Contact Phone"
               error={param.errors.contact_phone?.message}
            >
               <input
                  id="contact_phone"
                  type="tel"
                  placeholder="e.g., +84 901 234 567"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.contact_phone) })}
                  {...func.register('contact_phone')}
               />
            </FormField>

            <FormField
               id="contact_email"
               label="Contact Email"
               fullSpan
               error={param.errors.contact_email?.message}
            >
               <input
                  id="contact_email"
                  type="email"
                  placeholder="representative@company.com"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.contact_email) })}
                  {...func.register('contact_email')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Status & Configuration"
            description="Control whether this company and its associated accounts can access live events."
         >
            <FormField
               id="status"
               label="Account Status"
               hint="Suspended companies cannot launch live games or check in attendees."
               error={param.errors.status?.message}
            >
               <select
                  id="status"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.status) })}
                  {...func.register('status')}
               >
                  <option value="ACTIVE">ACTIVE — Operational access enabled</option>
                  <option value="INACTIVE">INACTIVE — Archived / Not active</option>
                  <option value="SUSPENDED">SUSPENDED — Access temporarily restricted</option>
               </select>
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};
