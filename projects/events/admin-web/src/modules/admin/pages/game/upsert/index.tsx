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

export const PageAdminGameUpsert: Router_Page = () => {
   const { param, func } = useLogic();
   const {
      wrapper,
      checkboxRow,
      checkboxInput,
      checkboxContent,
      checkboxTitle,
      checkboxHint,
      staffGrid,
      staffCard,
      staffLeft,
      staffInfo,
      staffName,
      staffEmail,
      roleBadge,
      emptyStaffNote,
      codeTextarea,
   } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={3} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Game ID', value: param.auditMeta.id },
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
            title={param.isEdit ? 'Edit Game' : 'Create Game'}
            subtitle={
               param.isEdit
                  ? 'Update game configuration, assigned venue staff, and live operational state.'
                  : 'Bind an interactive game to an event and assign on-site staff.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Create Game'}
            backAriaLabel="Back to games"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Game Identity & Event Binding"
            description="Select the parent event, game engine module, and live readiness status."
         >
            <FormField
               id="name"
               label="Game Title"
               required
               error={param.errors.name?.message}
            >
               <input
                  id="name"
                  type="text"
                  placeholder="e.g., Grand Gala Lucky Draw"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="event_id"
               label="Parent Event"
               required
               error={param.errors.event_id?.message}
            >
               <select
                  id="event_id"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.event_id) })}
                  {...func.register('event_id')}
               >
                  <option value="">Select an event...</option>
                  {param.events.map((evt) => (
                     <option
                        key={evt.id}
                        value={evt.id}
                     >
                        {evt.name}
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="game_type"
               label="Game Engine Type"
               required
               error={param.errors.game_type?.message}
            >
               <select
                  id="game_type"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.game_type) })}
                  {...func.register('game_type')}
               >
                  <option value="LUCKY_DRAW">LUCKY_DRAW — Interactive Lucky Draw</option>
               </select>
            </FormField>

            <FormField
               id="status"
               label="Operational Status"
               required
               error={param.errors.status?.message}
            >
               <select
                  id="status"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.status) })}
                  {...func.register('status')}
               >
                  <option value="PENDING">PENDING — Configuring prizes & attendees</option>
                  <option value="READY">READY — Ready for on-site check-in & launch</option>
                  <option value="LIVE">LIVE — Currently running on stage</option>
                  <option value="FINISHED">FINISHED — Completed & locked</option>
               </select>
            </FormField>

            {param.isSuperAdmin && (
               <FormField
                  id="is_dev_only"
                  label="Developer Beta Access"
                  fullSpan
                  error={param.errors.is_dev_only?.message}
               >
                  <div className={checkboxRow()}>
                     <input
                        id="is_dev_only"
                        type="checkbox"
                        className={checkboxInput()}
                        {...func.register('is_dev_only')}
                     />
                     <div className={checkboxContent()}>
                        <label
                           htmlFor="is_dev_only"
                           className={checkboxTitle()}
                        >
                           Restrict to SUPER_ADMIN only (is_dev_only)
                        </label>
                        <span className={checkboxHint()}>
                           When enabled, company Admins cannot view or launch this game while it is in beta testing.
                        </span>
                     </div>
                  </div>
               </FormField>
            )}

            <FormField
               id="description"
               label="Description & Operator Notes"
               fullSpan
               error={param.errors.description?.message}
            >
               <textarea
                  id="description"
                  rows={3}
                  placeholder="Instructions for on-site Field Staff and Guards..."
                  className={formControlStyle.textarea({ hasError: Boolean(param.errors.description) })}
                  {...func.register('description')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="On-Site Staff Assignment"
            description="Assign FIELD_STAFF (Live Game Operators) and GUARD (Check-In Security) accounts to this game."
         >
            {param.availableStaff.length === 0 ? (
               <div className={emptyStaffNote()}>
                  No active FIELD_STAFF or GUARD accounts found for the selected event&apos;s company. Create staff
                  accounts in the Accounts module first.
               </div>
            ) : (
               <div className={staffGrid()}>
                  {param.availableStaff.map((staff) => {
                     const isChecked = param.selectedStaffIds.includes(staff.id);
                     return (
                        <label
                           key={staff.id}
                           htmlFor={`staff-${staff.id}`}
                           className={staffCard({ selected: isChecked })}
                        >
                           <div className={staffLeft()}>
                              <input
                                 id={`staff-${staff.id}`}
                                 type="checkbox"
                                 checked={isChecked}
                                 onChange={() => func.handleToggleStaffAccount(staff.id)}
                                 className={checkboxInput()}
                              />
                              <div className={staffInfo()}>
                                 <span className={staffName()}>{staff.full_name}</span>
                                 <span className={staffEmail()}>{staff.email}</span>
                              </div>
                           </div>
                           <span
                              className={roleBadge({
                                 role: staff.role === 'GUARD' ? 'GUARD' : 'FIELD_STAFF',
                              })}
                           >
                              {staff.role}
                           </span>
                        </label>
                     );
                  })}
               </div>
            )}
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Game Engine Configuration"
            description="Custom JSON parameters passed to the [CLIENT_APP] game presentation engine."
         >
            <FormField
               id="config"
               label="Engine Config (JSON)"
               fullSpan
               hint='Valid JSON object (e.g., {"spinDurationMs": 5000, "allowRepeatWinners": false, "soundEffects": true}).'
               error={param.errors.config?.message}
            >
               <textarea
                  id="config"
                  rows={5}
                  placeholder='{"spinDurationMs": 5000}'
                  className={`${formControlStyle.textarea({ hasError: Boolean(param.errors.config) })} ${codeTextarea()}`}
                  {...func.register('config')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};

