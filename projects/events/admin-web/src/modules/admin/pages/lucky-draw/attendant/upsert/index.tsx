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

export const PageAdminLuckyDrawAttendantUpsert: Router_Page = () => {
   const { param, func } = useLogic();
   const {
      wrapper,
      checkboxRow,
      checkboxInput,
      checkboxContent,
      checkboxTitle,
      checkboxHint,
      codeTextarea,
   } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={3} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Attendant ID', value: param.auditMeta.id },
              { label: 'Created At', value: func.formatTimestamp(param.auditMeta.createdAt) },
              { label: 'Last Updated At', value: func.formatTimestamp(param.auditMeta.updatedAt) },
              { label: 'Checked In At', value: func.formatTimestamp(param.auditMeta.checkedInAt) },
              { label: 'Email Sent At', value: func.formatTimestamp(param.auditMeta.emailSentAt) },
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
            title={param.isEdit ? 'Edit Lucky Draw Attendant' : 'Register Lucky Draw Attendant'}
            subtitle={
               param.isEdit
                  ? 'Update attendee profile, ticket assignment, and venue check-in state.'
                  : 'Register a guest for a Lucky Draw game and auto-generate their unique QR payload.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Register Attendant'}
            backAriaLabel="Back to attendants"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Attendee Identity & Game Binding"
            description="Assign the attendee to a Lucky Draw game and configure their personal and corporate details."
         >
            <FormField
               id="game_id"
               label="Lucky Draw Game"
               required
               error={param.errors.game_id?.message}
            >
               <select
                  id="game_id"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.game_id) })}
                  {...func.register('game_id')}
               >
                  <option value="">Select a Lucky Draw game...</option>
                  {param.games.map((g) => (
                     <option
                        key={g.id}
                        value={g.id}
                     >
                        {g.events ? `${g.name} (${g.events.name})` : g.name}
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="full_name"
               label="Full Name"
               required
               error={param.errors.full_name?.message}
            >
               <input
                  id="full_name"
                  type="text"
                  placeholder="e.g., Nguyen Van A"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.full_name) })}
                  {...func.register('full_name')}
               />
            </FormField>

            <FormField
               id="email"
               label="Email Address"
               hint="Required for dispatching batch QR ticket emails."
               error={param.errors.email?.message}
            >
               <input
                  id="email"
                  type="email"
                  placeholder="guest@company.com"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.email) })}
                  {...func.register('email')}
               />
            </FormField>

            <FormField
               id="phone"
               label="Phone Number"
               error={param.errors.phone?.message}
            >
               <input
                  id="phone"
                  type="tel"
                  placeholder="+84 90 123 4567"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.phone) })}
                  {...func.register('phone')}
               />
            </FormField>

            <FormField
               id="company_name"
               label="Guest Company / Organization"
               error={param.errors.company_name?.message}
            >
               <input
                  id="company_name"
                  type="text"
                  placeholder="e.g., Acme Corp"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.company_name) })}
                  {...func.register('company_name')}
               />
            </FormField>

            <FormField
               id="department"
               label="Department / Title"
               error={param.errors.department?.message}
            >
               <input
                  id="department"
                  type="text"
                  placeholder="e.g., Engineering / VIP"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.department) })}
                  {...func.register('department')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Ticket, QR Payload & Operational Status"
            description="Configure the unique ticket code, QR hash, and live eligibility flags."
         >
            <FormField
               id="ticket_code"
               label="Ticket Code"
               required
               hint="Unique within the selected Lucky Draw game."
               error={param.errors.ticket_code?.message}
            >
               <input
                  id="ticket_code"
                  type="text"
                  placeholder="e.g., VIP-0042"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.ticket_code) })}
                  {...func.register('ticket_code')}
               />
            </FormField>

            <FormField
               id="qr_code_payload"
               label="QR Code Payload Hash"
               hint="Leave blank when creating to auto-generate a cryptographic QR hash."
               error={param.errors.qr_code_payload?.message}
            >
               <input
                  id="qr_code_payload"
                  type="text"
                  placeholder="Auto-generated if left blank"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.qr_code_payload) })}
                  {...func.register('qr_code_payload')}
               />
            </FormField>

            <FormField
               id="email_status"
               label="Email Dispatch Status"
               required
               error={param.errors.email_status?.message}
            >
               <select
                  id="email_status"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.email_status) })}
                  {...func.register('email_status')}
               >
                  <option value="NOT_SENT">NOT_SENT — Ticket email not sent yet</option>
                  <option value="SENDING">SENDING — Queued for delivery</option>
                  <option value="SENT">SENT — Delivered to attendee</option>
                  <option value="FAILED">FAILED — Delivery failed</option>
               </select>
            </FormField>

            <FormField
               id="is_checked_in"
               label="Venue Check-In Eligibility"
               error={param.errors.is_checked_in?.message}
            >
               <div className={checkboxRow()}>
                  <input
                     id="is_checked_in"
                     type="checkbox"
                     className={checkboxInput()}
                     {...func.register('is_checked_in')}
                  />
                  <div className={checkboxContent()}>
                     <label
                        htmlFor="is_checked_in"
                        className={checkboxTitle()}
                     >
                        Checked In at Venue (is_checked_in)
                     </label>
                     <span className={checkboxHint()}>
                        Only checked-in attendees are eligible to be drawn on stage.
                     </span>
                  </div>
               </div>
            </FormField>

            <FormField
               id="has_won"
               label="Winner State"
               fullSpan
               error={param.errors.has_won?.message}
            >
               <div className={checkboxRow()}>
                  <input
                     id="has_won"
                     type="checkbox"
                     className={checkboxInput()}
                     {...func.register('has_won')}
                  />
                  <div className={checkboxContent()}>
                     <label
                        htmlFor="has_won"
                        className={checkboxTitle()}
                     >
                        Has Already Won a Prize (has_won)
                     </label>
                     <span className={checkboxHint()}>
                        Attendees with has_won = true are excluded from subsequent draws.
                     </span>
                  </div>
               </div>
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Custom Attendee Metadata"
            description="Optional JSON key-value attributes (e.g., table number, dietary preference, badge tier)."
         >
            <FormField
               id="custom_metadata"
               label="Custom Metadata (JSON)"
               fullSpan
               hint='Valid JSON object (e.g., {"table": "A12", "vip": true}).'
               error={param.errors.custom_metadata?.message}
            >
               <textarea
                  id="custom_metadata"
                  rows={4}
                  placeholder='{"table": "A12"}'
                  className={`${formControlStyle.textarea({ hasError: Boolean(param.errors.custom_metadata) })} ${codeTextarea()}`}
                  {...func.register('custom_metadata')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};

