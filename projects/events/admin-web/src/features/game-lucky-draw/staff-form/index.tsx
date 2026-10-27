'use client';

import { Activity, Mail, Phone, Shield, User, UserPlus } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const StaffForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, param, func } = useLogic(properties);
   const { form, grid, full_span, select, empty_notice, footer } = useStyle;

   return (
      <form
         className={form}
         onSubmit={func.onSubmit}
      >
         {param.mode === 'assign' ? (
            <>
               {!state.isLoadingCandidates && state.candidates.length === 0 && (
                  <div className={empty_notice}>{func.translate('empty_candidates')}</div>
               )}

               <div className={grid}>
                  <FormField
                     id="staff-assign-account"
                     className={full_span}
                     Icon={UserPlus}
                     label={func.translate('fields.account.label')}
                     required
                     error={param.assignErrors.accountId?.message}
                  >
                     <select
                        id="staff-assign-account"
                        disabled={state.isLoadingCandidates || state.candidates.length === 0}
                        className={select}
                        {...func.registerAssign('accountId')}
                     >
                        <option value="">
                           {state.isLoadingCandidates
                              ? func.translate('fields.account.loading')
                              : func.translate('fields.account.placeholder')}
                        </option>
                        {state.candidates.map((candidate) => (
                           <option
                              key={candidate.id}
                              value={candidate.id}
                           >
                              {candidate.full_name} ({candidate.email}) — {func.translate(`roles.${candidate.role}`)}
                           </option>
                        ))}
                     </select>
                  </FormField>
               </div>
            </>
         ) : (
            <div className={grid}>
               <FormField
                  id="staff-edit-full-name"
                  Icon={User}
                  label={func.translate('fields.full_name.label')}
                  required
                  error={param.editErrors.full_name?.message}
               >
                  <input
                     id="staff-edit-full-name"
                     type="text"
                     placeholder={func.translate('fields.full_name.placeholder')}
                     {...func.registerEdit('full_name')}
                  />
               </FormField>

               <FormField
                  id="staff-edit-email"
                  Icon={Mail}
                  label={func.translate('fields.email.label')}
               >
                  <input
                     id="staff-edit-email"
                     type="email"
                     disabled
                     value={param.staff?.email ?? ''}
                  />
               </FormField>

               <FormField
                  id="staff-edit-phone"
                  Icon={Phone}
                  label={func.translate('fields.phone.label')}
                  error={param.editErrors.phone?.message}
               >
                  <input
                     id="staff-edit-phone"
                     type="tel"
                     placeholder={func.translate('fields.phone.placeholder')}
                     {...func.registerEdit('phone')}
                  />
               </FormField>

               <FormField
                  id="staff-edit-role"
                  Icon={Shield}
                  label={func.translate('fields.role.label')}
                  required
                  error={param.editErrors.role?.message}
               >
                  <select
                     id="staff-edit-role"
                     className={select}
                     {...func.registerEdit('role')}
                  >
                     <option value="FIELD_STAFF">{func.translate('roles.FIELD_STAFF')}</option>
                     <option value="GUARD">{func.translate('roles.GUARD')}</option>
                  </select>
               </FormField>

               <FormField
                  id="staff-edit-status"
                  className={full_span}
                  Icon={Activity}
                  label={func.translate('fields.status.label')}
                  required
                  error={param.editErrors.status?.message}
               >
                  <select
                     id="staff-edit-status"
                     className={select}
                     {...func.registerEdit('status')}
                  >
                     <option value="ACTIVE">{func.translate('statuses.ACTIVE')}</option>
                     <option value="INACTIVE">{func.translate('statuses.INACTIVE')}</option>
                  </select>
               </FormField>
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

