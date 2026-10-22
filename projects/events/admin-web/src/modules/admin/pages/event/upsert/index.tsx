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

export const PageAdminEventUpsert: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, slugRow, slugBtn, codeTextarea } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={3} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Event ID', value: param.auditMeta.id },
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
            title={param.isEdit ? 'Edit Event' : 'Create Event'}
            subtitle={
               param.isEdit
                  ? 'Update event schedule, venue details, branding, and operational status.'
                  : 'Create a new event to host interactive games and manage attendee check-ins.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Create Event'}
            backAriaLabel="Back to events"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Event Identity & Organization"
            description="Core event title, unique URL slug, and tenant organization ownership."
         >
            <FormField
               id="name"
               label="Event Name"
               required
               error={param.errors.name?.message}
            >
               <input
                  id="name"
                  type="text"
                  placeholder="e.g., Year-End Gala Dinner 2026"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="slug"
               label="Event Slug"
               required
               hint="Unique URL-safe identifier (lowercase letters, numbers, and hyphens)."
               error={param.errors.slug?.message}
            >
               <div className={slugRow()}>
                  <input
                     id="slug"
                     type="text"
                     placeholder="e.g., year-end-gala-dinner-2026"
                     className={formControlStyle.input({ hasError: Boolean(param.errors.slug) })}
                     {...func.register('slug')}
                  />
                  <button
                     type="button"
                     onClick={func.handleGenerateSlug}
                     className={slugBtn()}
                  >
                     Auto-Slug
                  </button>
               </div>
            </FormField>

            <FormField
               id="company_id"
               label="Organization / Company"
               required
               hint={
                  param.isSuperAdmin
                     ? 'Select the company that owns this event.'
                     : 'Scoped automatically to your company.'
               }
               error={param.errors.company_id?.message}
            >
               <select
                  id="company_id"
                  disabled={!param.isSuperAdmin}
                  className={formControlStyle.select({ hasError: Boolean(param.errors.company_id) })}
                  {...func.register('company_id')}
               >
                  <option value="">Select a company...</option>
                  {param.companies.map((company) => (
                     <option
                        key={company.id}
                        value={company.id}
                     >
                        {company.name}
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="status"
               label="Event Status"
               required
               error={param.errors.status?.message}
            >
               <select
                  id="status"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.status) })}
                  {...func.register('status')}
               >
                  <option value="DRAFT">DRAFT — In preparation</option>
                  <option value="UPCOMING">UPCOMING — Scheduled & ready for invitations</option>
                  <option value="ONGOING">ONGOING — Live at venue</option>
                  <option value="COMPLETED">COMPLETED — Event concluded</option>
                  <option value="CANCELLED">CANCELLED — Event cancelled</option>
               </select>
            </FormField>

            <FormField
               id="description"
               label="Event Description"
               fullSpan
               error={param.errors.description?.message}
            >
               <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the event agenda, audience, or special notes for on-site staff..."
                  className={formControlStyle.textarea({ hasError: Boolean(param.errors.description) })}
                  {...func.register('description')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Schedule & Venue Location"
            description="When and where the physical or hybrid event takes place."
         >
            <FormField
               id="start_time"
               label="Start Date & Time"
               error={param.errors.start_time?.message}
            >
               <input
                  id="start_time"
                  type="datetime-local"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.start_time) })}
                  {...func.register('start_time')}
               />
            </FormField>

            <FormField
               id="end_time"
               label="End Date & Time"
               error={param.errors.end_time?.message}
            >
               <input
                  id="end_time"
                  type="datetime-local"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.end_time) })}
                  {...func.register('end_time')}
               />
            </FormField>

            <FormField
               id="location_name"
               label="Venue Name"
               error={param.errors.location_name?.message}
            >
               <input
                  id="location_name"
                  type="text"
                  placeholder="e.g., Gem Center — Grand Ballroom"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.location_name) })}
                  {...func.register('location_name')}
               />
            </FormField>

            <FormField
               id="location_address"
               label="Venue Address"
               error={param.errors.location_address?.message}
            >
               <input
                  id="location_address"
                  type="text"
                  placeholder="8 Nguyen Binh Khiem, District 1, HCMC"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.location_address) })}
                  {...func.register('location_address')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Branding & Theme Configuration"
            description="Custom visual assets and JSON theme tokens for live big-screen presentations."
         >
            <FormField
               id="banner_url"
               label="Banner Image URL"
               fullSpan
               error={param.errors.banner_url?.message}
            >
               <input
                  id="banner_url"
                  type="url"
                  placeholder="https://example.com/events/gala-banner.webp"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.banner_url) })}
                  {...func.register('banner_url')}
               />
            </FormField>

            <FormField
               id="theme_config"
               label="Theme Configuration (JSON)"
               fullSpan
               hint='Valid JSON object passed to the live game presentation screen (e.g., {"primaryColor": "#0036e5", "backgroundUrl": ""}).'
               error={param.errors.theme_config?.message}
            >
               <textarea
                  id="theme_config"
                  rows={5}
                  placeholder='{"primaryColor": "#0036e5"}'
                  className={`${formControlStyle.textarea({ hasError: Boolean(param.errors.theme_config) })} ${codeTextarea()}`}
                  {...func.register('theme_config')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};

