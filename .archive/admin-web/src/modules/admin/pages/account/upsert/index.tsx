'use client';

import { Suspense } from 'react';
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

const PageAdminAccountUpsertContent = () => {
   const { param, func } = useLogic();
   const { wrapper } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={3} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Account ID', value: param.auditMeta.id },
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
            title={param.isEdit ? 'Edit Account' : 'Create Account'}
            subtitle={
               param.isEdit
                  ? 'Update account identity, role permissions, and portal access status.'
                  : 'Create credentials for event managers, field staff, or check-in guards.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Create Account'}
            backAriaLabel="Back to accounts"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Identity & Contact Profile"
            description="Personal details and contact information for the account holder."
         >
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
               id="username"
               label="Username"
               error={param.errors.username?.message}
            >
               <input
                  id="username"
                  type="text"
                  placeholder="e.g., nguyenvana"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.username) })}
                  {...func.register('username')}
               />
            </FormField>

            <FormField
               id="email"
               label="Email Address"
               required
               error={param.errors.email?.message}
            >
               <input
                  id="email"
                  type="email"
                  placeholder="staff@company.com"
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
                  placeholder="e.g., +84 901 234 567"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.phone) })}
                  {...func.register('phone')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Credentials & Role Assignment"
            description="Assign role-based permissions and tenant organization scope."
         >
            <FormField
               id="role"
               label="Account Role"
               required
               hint={
                  param.isSuperAdmin
                     ? 'SUPER_ADMIN and ADMIN access [ADMIN_WEB]; FIELD_STAFF and GUARD access [CLIENT_APP].'
                     : 'Company Admins can assign FIELD_STAFF (Live Game Operator) or GUARD (Check-In Tool) roles.'
               }
               error={param.errors.role?.message}
            >
               <select
                  id="role"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.role) })}
                  {...func.register('role')}
               >
                  {param.isSuperAdmin && (
                     <>
                        <option value="SUPER_ADMIN">SUPER_ADMIN — Global System Administrator</option>
                        <option value="ADMIN">ADMIN — Company Manager ([ADMIN_WEB])</option>
                     </>
                  )}
                  <option value="FIELD_STAFF">FIELD_STAFF — On-Site Game Operator ([CLIENT_APP])</option>
                  <option value="GUARD">GUARD — On-Site Check-In Security ([CLIENT_APP])</option>
               </select>
            </FormField>

            <FormField
               id="company_id"
               label="Assigned Company"
               hint={
                  param.isSuperAdmin
                     ? 'Select the tenant organization this account belongs to (optional for SUPER_ADMIN).'
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
                  {param.isSuperAdmin && <option value="">No company (Global / Unassigned)</option>}
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
               id="password"
               label={param.isEdit ? 'New Password (Optional)' : 'Initial Password'}
               required={!param.isEdit}
               fullSpan
               hint={
                  param.isEdit
                     ? 'Leave blank to keep the current password unchanged.'
                     : 'Minimum 6 characters required for initial login.'
               }
               error={param.errors.password?.message}
            >
               <input
                  id="password"
                  type="password"
                  placeholder={param.isEdit ? '•••••••• (Leave blank to keep unchanged)' : 'Enter initial password'}
                  className={formControlStyle.input({ hasError: Boolean(param.errors.password) })}
                  {...func.register('password')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Account Status"
            description="Control whether this user is allowed to authenticate into the ecosystem."
         >
            <FormField
               id="status"
               label="Access Status"
               hint="Deactivated accounts are immediately signed out and blocked from logging in."
               error={param.errors.status?.message}
            >
               <select
                  id="status"
                  className={formControlStyle.select({ hasError: Boolean(param.errors.status) })}
                  {...func.register('status')}
               >
                  <option value="ACTIVE">ACTIVE — Login enabled</option>
                  <option value="INACTIVE">INACTIVE — Deactivated / Blocked</option>
               </select>
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};

export const PageAdminAccountUpsert: Router_Page = () => (
   <Suspense fallback={<UpsertSkeleton cardCount={3} />}>
      <PageAdminAccountUpsertContent />
   </Suspense>
);
