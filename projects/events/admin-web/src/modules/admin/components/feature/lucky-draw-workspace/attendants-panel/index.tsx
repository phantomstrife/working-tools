'use client';

import { ChevronLeft, ChevronRight, Download, Mail, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';

import { ConfirmDeleteModal } from '@/components/search';
import { FormField, formControlStyle, UpsertErrorBanner } from '@/components/upsert';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { AttendantsPanelProps } from './use-logic';

export const AttendantsPanel = (props: AttendantsPanelProps) => {
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
      filterSelect,
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
      ticketBadge,
      boolBadge,
      rowActions,
      actionIconBtn,
      emptyState,
      skeletonRow,
      iconSm,
      iconMd,
      checkboxRow,
      checkboxInput,
      checkboxLabel,
      pagination,
      modal,
   } = useStyle;

   const isActionDisabled = param.isLoading || param.isPending;
   const isSaveDisabled = !param.isDirty || param.isPending;

   return (
      <>
         <div className={panel()}>
            <div className={header()}>
               <div className={titleGroup()}>
                  <h3 className={title()}>Attendant Management</h3>
                  <span className={countPill()}>
                     {param.filteredAttendants.length} / {param.totalCount}
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
                     disabled={isActionDisabled || param.filteredAttendants.length === 0}
                     onClick={func.handleSendBatchEmails}
                     className={secondaryBtn({
                        disabled: isActionDisabled || param.filteredAttendants.length === 0,
                     })}
                  >
                     <Mail className={iconSm()} />
                     <span>Send Emails</span>
                  </button>

                  <button
                     type="button"
                     disabled={isActionDisabled}
                     onClick={func.handleExportWinnerCsv}
                     className={secondaryBtn({ disabled: isActionDisabled })}
                  >
                     <Download className={iconSm()} />
                     <span>Export CSV Winner</span>
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
                     placeholder="Search by name, phone, email, or ticket..."
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

               <select
                  aria-label="Filter attendants"
                  value={param.filterValue}
                  onChange={func.handleFilterChange}
                  className={filterSelect()}
               >
                  <option value="ALL">Filter: All Attendants</option>
                  <optgroup label="Check-In Status">
                     <option value="CHECKED_IN">Check-In: Checked In</option>
                     <option value="NOT_CHECKED_IN">Check-In: Not Checked In</option>
                  </optgroup>
                  <optgroup label="Winner Status">
                     <option value="WINNER">Winner: Has Won</option>
                     <option value="NOT_WINNER">Winner: Not Won</option>
                  </optgroup>
                  <optgroup label="Email Status">
                     <option value="EMAIL_SENT">Email: Sent</option>
                     <option value="EMAIL_NOT_SENT">Email: Not Sent</option>
                     <option value="EMAIL_FAILED">Email: Failed</option>
                  </optgroup>
               </select>
            </div>

            <div className={tableScroll()}>
               <table className={table()}>
                  <thead className={thead()}>
                     <tr>
                        <th className={th()}>Full Name</th>
                        <th className={th()}>Phone</th>
                        <th className={th()}>Email</th>
                        <th className={th()}>Ticket Code</th>
                        <th className={th()}>Checked In</th>
                        <th className={th()}>Has Won</th>
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
                              {Array.from({ length: 7 }).map((__, colIdx) => (
                                 <td
                                    key={colIdx}
                                    className={td()}
                                 >
                                    <div className={skeletonRow()} />
                                 </td>
                              ))}
                           </tr>
                        ))
                     ) : param.filteredAttendants.length === 0 ? (
                        <tr>
                           <td
                              colSpan={7}
                              className={emptyState()}
                           >
                              {param.totalCount === 0
                                 ? 'No attendants registered for this Lucky Draw game yet. Click "Create" or "Import CSV" to add guests.'
                                 : 'No attendants match your search or filter criteria.'}
                           </td>
                        </tr>
                     ) : (
                        param.paginatedAttendants.map((item) => (
                           <tr
                              key={item.id}
                              className={tr()}
                           >
                              <td className={td()}>
                                 <span className={nameText()}>{item.full_name}</span>
                              </td>
                              <td className={td()}>{item.phone || '—'}</td>
                              <td className={td()}>{item.email || '—'}</td>
                              <td className={td()}>
                                 <span className={ticketBadge()}>{item.ticket_code}</span>
                              </td>
                              <td className={td()}>
                                 <span
                                    className={boolBadge({
                                       variant: item.is_checked_in ? 'checkedIn' : 'notCheckedIn',
                                    })}
                                 >
                                    {item.is_checked_in ? 'Checked In' : 'Pending'}
                                 </span>
                              </td>
                              <td className={td()}>
                                 <span
                                    className={boolBadge({
                                       variant: item.has_won ? 'winner' : 'notWinner',
                                    })}
                                 >
                                    {item.has_won ? 'Winner' : 'No'}
                                 </span>
                              </td>
                              <td className={tdRight()}>
                                 <div className={rowActions()}>
                                    <button
                                       type="button"
                                       title="Quick Edit Attendant"
                                       aria-label={`Edit ${item.full_name}`}
                                       onClick={() => func.handleOpenEditModal(item)}
                                       className={actionIconBtn()}
                                    >
                                       <Pencil className={iconMd()} />
                                    </button>
                                    <button
                                       type="button"
                                       title="Delete Attendant"
                                       aria-label={`Delete ${item.full_name}`}
                                       onClick={() => func.handlePromptDelete(item)}
                                       className={actionIconBtn({ danger: true })}
                                    >
                                       <Trash2 className={iconMd()} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            <div className={pagination.wrapper()}>
               <span className={pagination.summary()}>
                  Showing {param.rangeStart}–{param.rangeEnd} of {param.filteredAttendants.length}
                  {param.filteredAttendants.length !== param.totalCount
                     ? ` (filtered from ${param.totalCount} total)`
                     : ''}
               </span>

               <div className={pagination.controls()}>
                  <select
                     value={String(param.limit)}
                     onChange={func.handleLimitChange}
                     className={pagination.limitSelect()}
                     aria-label="Rows per page"
                  >
                     {param.pageSizeOptions.map((size) => (
                        <option
                           key={size}
                           value={String(size)}
                        >
                           {size} / page
                        </option>
                     ))}
                  </select>

                  <div className={pagination.navGroup()}>
                     <button
                        type="button"
                        onClick={() => func.handlePageChange(param.page - 1)}
                        disabled={param.page <= 1}
                        className={pagination.pageBtn({ disabled: param.page <= 1 })}
                        aria-label="Previous page"
                     >
                        <ChevronLeft className={iconMd()} />
                     </button>

                     <span className={pagination.pageIndicator()}>
                        Page {param.page} of {param.totalPages}
                     </span>

                     <button
                        type="button"
                        onClick={() => func.handlePageChange(param.page + 1)}
                        disabled={param.page >= param.totalPages}
                        className={pagination.pageBtn({ disabled: param.page >= param.totalPages })}
                        aria-label="Next page"
                     >
                        <ChevronRight className={iconMd()} />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {param.isModalOpen && (
            <div
               className={modal.backdrop()}
               role="dialog"
               aria-modal="true"
               aria-labelledby="attendant-quick-modal-title"
            >
               <form
                  className={modal.panel()}
                  onSubmit={func.onSubmit}
                  noValidate
               >
                  <div className={modal.header()}>
                     <h3
                        id="attendant-quick-modal-title"
                        className={modal.headerTitle()}
                     >
                        {param.isEdit ? 'Quick Edit Attendant' : 'Create Attendant'}
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
                           id="attendant-root-error"
                           label=""
                           fullSpan
                        >
                           <UpsertErrorBanner message={param.errors.root.message} />
                        </FormField>
                     )}

                     <FormField
                        id="attendant-full-name"
                        label="Full Name"
                        required
                        error={param.errors.full_name?.message}
                     >
                        <input
                           id="attendant-full-name"
                           type="text"
                           placeholder="e.g., Nguyen Van A"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.full_name) })}
                           {...func.register('full_name')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-ticket-code"
                        label="Ticket Code"
                        required
                        error={param.errors.ticket_code?.message}
                     >
                        <input
                           id="attendant-ticket-code"
                           type="text"
                           placeholder="e.g., TKT-0001"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.ticket_code) })}
                           {...func.register('ticket_code')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-email"
                        label="Email"
                        error={param.errors.email?.message}
                     >
                        <input
                           id="attendant-email"
                           type="email"
                           placeholder="guest@company.com"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.email) })}
                           {...func.register('email')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-phone"
                        label="Phone"
                        error={param.errors.phone?.message}
                     >
                        <input
                           id="attendant-phone"
                           type="tel"
                           placeholder="+84 90 123 4567"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.phone) })}
                           {...func.register('phone')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-company"
                        label="Company Name"
                        error={param.errors.company_name?.message}
                     >
                        <input
                           id="attendant-company"
                           type="text"
                           placeholder="Organization"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.company_name) })}
                           {...func.register('company_name')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-dept"
                        label="Department"
                        error={param.errors.department?.message}
                     >
                        <input
                           id="attendant-dept"
                           type="text"
                           placeholder="Department / Title"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.department) })}
                           {...func.register('department')}
                        />
                     </FormField>

                     <FormField
                        id="attendant-email-status"
                        label="Email Status"
                        fullSpan
                        error={param.errors.email_status?.message}
                     >
                        <select
                           id="attendant-email-status"
                           className={formControlStyle.select({
                              hasError: Boolean(param.errors.email_status),
                           })}
                           {...func.register('email_status')}
                        >
                           <option value="NOT_SENT">NOT_SENT</option>
                           <option value="SENDING">SENDING</option>
                           <option value="SENT">SENT</option>
                           <option value="FAILED">FAILED</option>
                        </select>
                     </FormField>

                     <div className={checkboxRow()}>
                        <input
                           id="attendant-checked-in"
                           type="checkbox"
                           className={checkboxInput()}
                           {...func.register('is_checked_in')}
                        />
                        <label
                           htmlFor="attendant-checked-in"
                           className={checkboxLabel()}
                        >
                           Checked In at Venue
                        </label>
                     </div>

                     <div className={checkboxRow()}>
                        <input
                           id="attendant-has-won"
                           type="checkbox"
                           className={checkboxInput()}
                           {...func.register('has_won')}
                        />
                        <label
                           htmlFor="attendant-has-won"
                           className={checkboxLabel()}
                        >
                           Has Won a Prize
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
                        {param.isPending ? 'Saving...' : param.isEdit ? 'Save Changes' : 'Create Attendant'}
                     </button>
                  </div>
               </form>
            </div>
         )}

         <ConfirmDeleteModal
            isOpen={Boolean(param.deleteTarget)}
            title={param.deleteTarget ? `Delete "${param.deleteTarget.full_name}"?` : 'Delete Attendant?'}
            entityName={param.deleteTarget?.full_name ?? ''}
            descriptionSuffix="Any associated winner records for this attendee will also be permanently deleted."
            confirmLabel="Delete Attendant"
            isPending={param.isPending}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />
      </>
   );
};
