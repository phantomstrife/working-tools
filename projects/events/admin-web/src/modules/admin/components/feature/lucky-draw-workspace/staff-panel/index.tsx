'use client';

import { Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';

import { ConfirmDeleteModal } from '@/components/search';
import { FormField, formControlStyle, UpsertErrorBanner } from '@/components/upsert';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { StaffPanelProps } from './use-logic';

export const StaffPanel = (props: StaffPanelProps) => {
   const { param, func } = useLogic(props);
   const {
      panel,
      header,
      titleGroup,
      title,
      countPill,
      actionsGroup,
      hiddenInput,
      secondaryBtn,
      primaryBtn,
      toolbar,
      searchBox,
      searchIcon,
      searchInput,
      clearSearchBtn,
      tableScroll,
      table,
      thead,
      th,
      thRight,
      tbody,
      tr,
      td,
      tdRight,
      nameText,
      roleBadge,
      activeBadge,
      rowActions,
      actionIconBtn,
      emptyState,
      skeletonRow,
      iconSm,
      iconMd,
      checkboxRow,
      checkboxInput,
      checkboxLabel,
      modal,
   } = useStyle;

   const isActionDisabled = param.isLoading || param.isPending;
   const isSaveDisabled = !param.isDirty || param.isPending;

   return (
      <>
         <div className={panel()}>
            <div className={header()}>
               <div className={titleGroup()}>
                  <h3 className={title()}>Staff Management</h3>
                  <span className={countPill()}>
                     {param.filteredStaff.length} / {param.totalCount}
                  </span>
               </div>

               <div className={actionsGroup()}>
                  <input
                     id={param.csvInputId}
                     type="file"
                     accept=".csv,text/csv"
                     onChange={func.handleImportCsvFile}
                     className={hiddenInput()}
                  />

                  <button
                     type="button"
                     disabled={isActionDisabled}
                     onClick={func.handleTriggerImportCsv}
                     className={secondaryBtn({ disabled: isActionDisabled })}
                  >
                     <Upload className={iconSm()} />
                     <span>Import CSV</span>
                  </button>

                  <button
                     type="button"
                     disabled={isActionDisabled}
                     onClick={func.handleOpenCreateModal}
                     className={primaryBtn({ disabled: isActionDisabled })}
                  >
                     <Plus className={iconSm()} />
                     <span>Create</span>
                  </button>
               </div>
            </div>

            <div className={toolbar()}>
               <div className={searchBox()}>
                  <Search className={searchIcon()} />
                  <input
                     type="text"
                     value={param.searchQuery}
                     onChange={func.handleSearchChange}
                     placeholder="Search by name, phone, or email..."
                     className={searchInput()}
                  />
                  {param.searchQuery && (
                     <button
                        type="button"
                        aria-label="Clear search"
                        onClick={func.handleClearSearch}
                        className={clearSearchBtn()}
                     >
                        <X className={iconSm()} />
                     </button>
                  )}
               </div>
            </div>

            <div className={tableScroll()}>
               <table className={table()}>
                  <thead className={thead()}>
                     <tr>
                        <th className={th()}>Full Name</th>
                        <th className={th()}>Email</th>
                        <th className={th()}>Phone</th>
                        <th className={th()}>Role</th>
                        <th className={th()}>Status</th>
                        <th className={thRight()}>Actions</th>
                     </tr>
                  </thead>
                  <tbody className={tbody()}>
                     {param.isLoading ? (
                        Array.from({ length: 5 }).map((_, rowIdx) => (
                           <tr
                              key={rowIdx}
                              className={tr()}
                           >
                              {Array.from({ length: 6 }).map((__, colIdx) => (
                                 <td
                                    key={colIdx}
                                    className={td()}
                                 >
                                    <div className={skeletonRow()} />
                                 </td>
                              ))}
                           </tr>
                        ))
                     ) : param.filteredStaff.length === 0 ? (
                        <tr>
                           <td
                              colSpan={6}
                              className={emptyState()}
                           >
                              {param.totalCount === 0
                                 ? 'No staff members assigned to this game yet. Click "Create" or "Import CSV" to add and assign staff.'
                                 : 'No assigned staff match your search query.'}
                           </td>
                        </tr>
                     ) : (
                        param.filteredStaff.map((member) => {
                           const isActive = member.is_active !== false;
                           return (
                              <tr
                                 key={member.assignmentId}
                                 className={tr()}
                              >
                                 <td className={td()}>
                                    <span className={nameText()}>{member.full_name}</span>
                                 </td>
                                 <td className={td()}>{member.email}</td>
                                 <td className={td()}>{member.phone || '—'}</td>
                                 <td className={td()}>
                                    <span className={roleBadge({ role: member.role })}>{member.role}</span>
                                 </td>
                                 <td className={td()}>
                                    <span className={activeBadge({ active: isActive })}>
                                       {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                 </td>
                                 <td className={tdRight()}>
                                    <div className={rowActions()}>
                                       <button
                                          type="button"
                                          title="Quick Edit Staff"
                                          aria-label={`Edit ${member.full_name}`}
                                          onClick={() => func.handleOpenEditModal(member)}
                                          className={actionIconBtn()}
                                       >
                                          <Pencil className={iconMd()} />
                                       </button>
                                       <button
                                          type="button"
                                          title="Delete Staff"
                                          aria-label={`Delete ${member.full_name}`}
                                          onClick={() => func.handlePromptDelete(member)}
                                          className={actionIconBtn({ danger: true })}
                                       >
                                          <Trash2 className={iconMd()} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {param.isModalOpen && (
            <div
               className={modal.backdrop()}
               role="dialog"
               aria-modal="true"
               aria-labelledby="staff-quick-modal-title"
            >
               <form
                  className={modal.panel()}
                  onSubmit={func.onSubmit}
                  noValidate
               >
                  <div className={modal.header()}>
                     <h3
                        id="staff-quick-modal-title"
                        className={modal.headerTitle()}
                     >
                        {param.isEdit ? 'Quick Edit Staff Account' : 'Create & Assign Staff Account'}
                     </h3>
                     <button
                        type="button"
                        aria-label="Close modal"
                        onClick={func.handleCloseModal}
                        className={modal.closeBtn()}
                     >
                        <X className={iconMd()} />
                     </button>
                  </div>

                  <div className={modal.body()}>
                     {param.errors.root?.message && (
                        <FormField
                           id="staff-root-error"
                           label=""
                           fullSpan
                        >
                           <UpsertErrorBanner message={param.errors.root.message} />
                        </FormField>
                     )}

                     <FormField
                        id="staff-full-name"
                        label="Full Name"
                        required
                        error={param.errors.full_name?.message}
                     >
                        <input
                           id="staff-full-name"
                           type="text"
                           placeholder="e.g., Tran Thi B"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.full_name) })}
                           {...func.register('full_name')}
                        />
                     </FormField>

                     <FormField
                        id="staff-email"
                        label="Email"
                        required
                        error={param.errors.email?.message}
                     >
                        <input
                           id="staff-email"
                           type="email"
                           placeholder="staff@company.com"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.email) })}
                           {...func.register('email')}
                        />
                     </FormField>

                     <FormField
                        id="staff-username"
                        label="Username"
                        error={param.errors.username?.message}
                     >
                        <input
                           id="staff-username"
                           type="text"
                           placeholder="Optional username"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.username) })}
                           {...func.register('username')}
                        />
                     </FormField>

                     <FormField
                        id="staff-phone"
                        label="Phone"
                        error={param.errors.phone?.message}
                     >
                        <input
                           id="staff-phone"
                           type="tel"
                           placeholder="+84 90 123 4567"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.phone) })}
                           {...func.register('phone')}
                        />
                     </FormField>

                     <FormField
                        id="staff-role"
                        label="Staff Role"
                        required
                        error={param.errors.role?.message}
                     >
                        <select
                           id="staff-role"
                           className={formControlStyle.select({ hasError: Boolean(param.errors.role) })}
                           {...func.register('role')}
                        >
                           <option value="FIELD_STAFF">FIELD_STAFF — Stage Game Operator</option>
                           <option value="GUARD">GUARD — Venue Check-In Security</option>
                        </select>
                     </FormField>

                     <FormField
                        id="staff-password"
                        label={param.isEdit ? 'New Password (Optional)' : 'Password'}
                        required={!param.isEdit}
                        error={param.errors.password?.message}
                     >
                        <input
                           id="staff-password"
                           type="password"
                           placeholder={param.isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
                           className={formControlStyle.input({ hasError: Boolean(param.errors.password) })}
                           {...func.register('password')}
                        />
                     </FormField>

                     <div className={checkboxRow()}>
                        <input
                           id="staff-is-active"
                           type="checkbox"
                           className={checkboxInput()}
                           {...func.register('is_active')}
                        />
                        <label
                           htmlFor="staff-is-active"
                           className={checkboxLabel()}
                        >
                           Account is Active (allowed to sign into [CLIENT_APP])
                        </label>
                     </div>
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
                        {param.isPending ? 'Saving...' : param.isEdit ? 'Save Changes' : 'Create & Assign'}
                     </button>
                  </div>
               </form>
            </div>
         )}

         <ConfirmDeleteModal
            isOpen={Boolean(param.deleteTarget)}
            title={param.deleteTarget ? `Delete "${param.deleteTarget.full_name}"?` : 'Delete Staff Account?'}
            entityName={param.deleteTarget?.full_name ?? ''}
            descriptionSuffix="This staff account will be removed from the game and deleted from the system."
            confirmLabel="Delete Staff"
            isPending={param.isPending}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />
      </>
   );
};
