'use client';

import {
   AlertTriangle,
   ArrowUpDown,
   Building2,
   ChevronLeft,
   ChevronRight,
   Copy,
   Download,
   Edit,
   Loader2,
   MoreHorizontal,
   Plus,
   Search,
   Trash2,
   Upload,
   X,
} from 'lucide-react';
import { Toaster } from 'sonner';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { StatusFilter } from './use-logic';

const PRESET_TABS: ReadonlyArray<{ label: string; value: StatusFilter }> = [
   { label: 'All Companies', value: 'ALL' },
   { label: 'Active', value: 'ACTIVE' },
   { label: 'Inactive', value: 'INACTIVE' },
   { label: 'Suspended', value: 'SUSPENDED' },
];

const SKELETON_ROWS = [1, 2, 3, 4, 5];

export const PageAdminCompanySearch: Router_Page = () => {
   const { param, func } = useLogic();
   const {
      wrapper,
      headerBlock,
      presetTabs,
      toolbarBlock,
      bulkBar,
      tableBlock,
      emptyBlock,
      paginationBlock,
      modalBlock,
      icon,
   } = useStyle;

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <header className={headerBlock.wrapper()}>
            <div className={headerBlock.titleGroup()}>
               <h1 className={headerBlock.title()}>Companies</h1>
               <span className={headerBlock.subtitle()}>
                  Manage tenant organizations, primary contacts, and operational access status.
               </span>
            </div>

            <div className={headerBlock.actions()}>
               <input
                  id={param.csvInputId}
                  type="file"
                  accept=".csv"
                  className={headerBlock.hiddenInput()}
                  onChange={func.handleImportCsvFile}
               />
               <button
                  type="button"
                  onClick={func.handleTriggerImportCsv}
                  disabled={param.isPendingMutation}
                  className={headerBlock.secondaryBtn({ disabled: param.isPendingMutation })}
               >
                  <Upload className={icon.sm()} />
                  Import CSV
               </button>
               <button
                  type="button"
                  onClick={func.handleExportAllCsv}
                  disabled={param.isLoading || param.items.length === 0}
                  className={headerBlock.secondaryBtn({ disabled: param.isLoading || param.items.length === 0 })}
               >
                  <Download className={icon.sm()} />
                  Export CSV
               </button>
               <button
                  type="button"
                  onClick={func.handleNavigateCreate}
                  className={headerBlock.primaryBtn()}
               >
                  <Plus className={icon.sm()} />
                  Create Company
               </button>
            </div>
         </header>

         <nav
            className={presetTabs.wrapper()}
            aria-label="Company status presets"
         >
            {PRESET_TABS.map((tab) => (
               <button
                  key={tab.value}
                  type="button"
                  onClick={() => func.handleStatusChange(tab.value)}
                  className={presetTabs.tab({ active: param.statusFilter === tab.value })}
               >
                  {tab.label}
               </button>
            ))}
         </nav>

         <section className={toolbarBlock.wrapper()}>
            <div className={toolbarBlock.controlsRow()}>
               <div className={toolbarBlock.searchBox()}>
                  <Search className={toolbarBlock.searchIcon()} />
                  <input
                     type="search"
                     value={param.searchInput}
                     onChange={(e) => func.setSearchInput(e.target.value)}
                     placeholder="Search by name, tax code, contact person, or email..."
                     className={toolbarBlock.searchInput()}
                  />
                  {param.searchInput && (
                     <button
                        type="button"
                        onClick={func.handleClearSearch}
                        className={toolbarBlock.clearSearchBtn()}
                        aria-label="Clear search"
                     >
                        <X className={icon.xs()} />
                     </button>
                  )}
               </div>

               <div className={toolbarBlock.filterGroup()}>
                  <select
                     value={param.statusFilter}
                     onChange={(e) =>
                        func.handleStatusChange(
                           e.target.value === 'ACTIVE' ||
                              e.target.value === 'INACTIVE' ||
                              e.target.value === 'SUSPENDED'
                              ? e.target.value
                              : 'ALL',
                        )
                     }
                     className={toolbarBlock.select()}
                     aria-label="Filter by status"
                  >
                     <option value="ALL">Status: All</option>
                     <option value="ACTIVE">Status: Active</option>
                     <option value="INACTIVE">Status: Inactive</option>
                     <option value="SUSPENDED">Status: Suspended</option>
                  </select>

                  <select
                     value={param.sortBy}
                     onChange={(e) => func.handleSortFieldChange(e.target.value)}
                     className={toolbarBlock.select()}
                     aria-label="Sort field"
                  >
                     <option value="created_at">Sort: Created Date</option>
                     <option value="updated_at">Sort: Updated Date</option>
                     <option value="name">Sort: Company Name</option>
                     <option value="status">Sort: Status</option>
                  </select>

                  <button
                     type="button"
                     onClick={func.handleToggleSortOrder}
                     className={toolbarBlock.sortOrderBtn()}
                  >
                     <ArrowUpDown className={icon.xs()} />
                     {param.sortOrder === 'asc' ? 'ASC' : 'DESC'}
                  </button>
               </div>
            </div>

            {param.hasActiveFilters && (
               <div className={toolbarBlock.chipsRow()}>
                  {param.urlQuery && (
                     <span className={toolbarBlock.chip()}>
                        Search: &ldquo;{param.urlQuery}&rdquo;
                        <button
                           type="button"
                           onClick={func.handleClearSearch}
                           className={toolbarBlock.chipRemoveBtn()}
                           aria-label="Remove search filter"
                        >
                           <X className={icon.xs()} />
                        </button>
                     </span>
                  )}

                  {param.statusFilter !== 'ALL' && (
                     <span className={toolbarBlock.chip()}>
                        Status: {param.statusFilter}
                        <button
                           type="button"
                           onClick={() => func.handleStatusChange('ALL')}
                           className={toolbarBlock.chipRemoveBtn()}
                           aria-label="Remove status filter"
                        >
                           <X className={icon.xs()} />
                        </button>
                     </span>
                  )}

                  <button
                     type="button"
                     onClick={func.handleClearAllFilters}
                     className={toolbarBlock.clearAllBtn()}
                  >
                     Clear all
                  </button>
               </div>
            )}
         </section>

         {param.selectedIds.length > 0 && (
            <div className={bulkBar.wrapper()}>
               <div className={bulkBar.leftGroup()}>
                  <span className={bulkBar.countText()}>{param.selectedIds.length} selected</span>
                  <button
                     type="button"
                     onClick={func.clearSelection}
                     className={bulkBar.clearBtn()}
                  >
                     Clear selection
                  </button>
               </div>

               <div className={bulkBar.actions()}>
                  <button
                     type="button"
                     onClick={() => func.handleBulkStatusChange('ACTIVE')}
                     disabled={param.isPendingMutation}
                     className={bulkBar.actionBtn()}
                  >
                     Set Active
                  </button>
                  <button
                     type="button"
                     onClick={() => func.handleBulkStatusChange('INACTIVE')}
                     disabled={param.isPendingMutation}
                     className={bulkBar.actionBtn()}
                  >
                     Set Inactive
                  </button>
                  <button
                     type="button"
                     onClick={() => func.handleBulkStatusChange('SUSPENDED')}
                     disabled={param.isPendingMutation}
                     className={bulkBar.actionBtn()}
                  >
                     Set Suspended
                  </button>
                  <button
                     type="button"
                     onClick={func.handleBulkExportCsv}
                     className={bulkBar.actionBtn()}
                  >
                     <Download className={icon.xs()} />
                     Export Selected
                  </button>
                  <button
                     type="button"
                     onClick={func.handleOpenBulkDelete}
                     disabled={param.isPendingMutation}
                     className={bulkBar.dangerBtn()}
                  >
                     <Trash2 className={icon.xs()} />
                     Delete Selected
                  </button>
               </div>
            </div>
         )}

         <section className={tableBlock.container()}>
            <div className={tableBlock.scrollWrapper()}>
               <table className={tableBlock.table()}>
                  <thead className={tableBlock.thead()}>
                     <tr>
                        <th className={tableBlock.thCheckbox()}>
                           <input
                              type="checkbox"
                              checked={param.isAllSelected}
                              onChange={func.handleToggleSelectAll}
                              className={tableBlock.checkbox()}
                              aria-label="Select all companies on current page"
                           />
                        </th>
                        <th className={tableBlock.th()}>Company</th>
                        <th className={tableBlock.th()}>Tax Code</th>
                        <th className={tableBlock.th()}>Industry</th>
                        <th className={tableBlock.th()}>Primary Contact</th>
                        <th className={tableBlock.th()}>Status</th>
                        <th className={tableBlock.th()}>Created</th>
                        <th className={tableBlock.thAction()}>Actions</th>
                     </tr>
                  </thead>

                  <tbody className={tableBlock.tbody()}>
                     {param.isLoading &&
                        SKELETON_ROWS.map((rowKey) => (
                           <tr
                              key={rowKey}
                              className={tableBlock.tr()}
                           >
                              <td className={tableBlock.tdCheckbox()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.td()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                              <td className={tableBlock.tdAction()}>
                                 <div className={tableBlock.skeletonRow()} />
                              </td>
                           </tr>
                        ))}

                     {!param.isLoading &&
                        param.items.map((company) => {
                           const isSelected = param.selectedIds.includes(company.id);
                           const isMenuOpen = param.openMenuId === company.id;

                           return (
                              <tr
                                 key={company.id}
                                 className={tableBlock.tr({ selected: isSelected })}
                              >
                                 <td className={tableBlock.tdCheckbox()}>
                                    <input
                                       type="checkbox"
                                       checked={isSelected}
                                       onChange={() => func.handleToggleSelectRow(company.id)}
                                       className={tableBlock.checkbox()}
                                       aria-label={`Select ${company.name}`}
                                    />
                                 </td>

                                 <td className={tableBlock.td()}>
                                    <div className={tableBlock.companyCell()}>
                                       <button
                                          type="button"
                                          onClick={() => func.handleNavigateEdit(company.id)}
                                          className={tableBlock.companyNameBtn()}
                                       >
                                          {company.name}
                                       </button>
                                       <span className={tableBlock.companyMeta()}>
                                          {company.address || 'No headquarters address'}
                                       </span>
                                    </div>
                                 </td>

                                 <td className={tableBlock.td()}>{company.tax_code || '—'}</td>

                                 <td className={tableBlock.td()}>{company.industry || '—'}</td>

                                 <td className={tableBlock.td()}>
                                    <div className={tableBlock.contactCell()}>
                                       <span className={tableBlock.contactName()}>
                                          {company.contact_person || '—'}
                                       </span>
                                       <span className={tableBlock.contactSub()}>
                                          {company.contact_email || company.contact_phone || '—'}
                                       </span>
                                    </div>
                                 </td>

                                 <td className={tableBlock.td()}>
                                    <span
                                       className={tableBlock.statusBadge({
                                          status: company.status ?? 'INACTIVE',
                                       })}
                                    >
                                       {company.status ?? 'INACTIVE'}
                                    </span>
                                 </td>

                                 <td className={tableBlock.td()}>{func.formatDate(company.created_at)}</td>

                                 <td className={tableBlock.tdAction()}>
                                    <button
                                       type="button"
                                       onClick={() => func.handleToggleRowMenu(company.id)}
                                       className={tableBlock.menuTrigger()}
                                       aria-label={`Open actions for ${company.name}`}
                                    >
                                       <MoreHorizontal className={icon.sm()} />
                                    </button>

                                    {isMenuOpen && (
                                       <div
                                          className={tableBlock.menuDropdown()}
                                          onMouseLeave={func.handleCloseRowMenu}
                                       >
                                          <button
                                             type="button"
                                             onClick={() => func.handleNavigateEdit(company.id)}
                                             className={tableBlock.menuItem()}
                                          >
                                             <Edit className={icon.xs()} />
                                             Edit
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => func.handleDuplicateRow(company)}
                                             className={tableBlock.menuItem()}
                                          >
                                             <Copy className={icon.xs()} />
                                             Duplicate
                                          </button>
                                          <button
                                             type="button"
                                             onClick={() => func.handlePromptDelete(company)}
                                             className={tableBlock.menuItem({ danger: true })}
                                          >
                                             <Trash2 className={icon.xs()} />
                                             Delete
                                          </button>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>

            {!param.isLoading && param.items.length === 0 && (
               <div className={emptyBlock.wrapper()}>
                  <div className={emptyBlock.iconBox()}>
                     <Building2 className={icon.lg()} />
                  </div>
                  {param.hasActiveFilters ? (
                     <>
                        <h2 className={emptyBlock.title()}>No companies match your active filters</h2>
                        <p className={emptyBlock.description()}>
                           Try adjusting your search keywords or clearing the active status filter.
                        </p>
                        <button
                           type="button"
                           onClick={func.handleClearAllFilters}
                           className={headerBlock.secondaryBtn()}
                        >
                           Clear Filters
                        </button>
                     </>
                  ) : (
                     <>
                        <h2 className={emptyBlock.title()}>No companies created yet</h2>
                        <p className={emptyBlock.description()}>
                           Create your first tenant company to start configuring events, games, and administrator
                           accounts.
                        </p>
                        <button
                           type="button"
                           onClick={func.handleNavigateCreate}
                           className={headerBlock.primaryBtn()}
                        >
                           <Plus className={icon.sm()} />
                           Create First Company
                        </button>
                     </>
                  )}
               </div>
            )}

            <div className={paginationBlock.wrapper()}>
               <span className={paginationBlock.summary()}>
                  Showing {param.rangeStart}–{param.rangeEnd} of {param.total}
               </span>

               <div className={paginationBlock.controls()}>
                  <select
                     value={String(param.limit)}
                     onChange={(e) => func.handleLimitChange(e.target.value)}
                     className={paginationBlock.limitSelect()}
                     aria-label="Rows per page"
                  >
                     <option value="10">10 / page</option>
                     <option value="20">20 / page</option>
                     <option value="50">50 / page</option>
                  </select>

                  <div className={paginationBlock.navGroup()}>
                     <button
                        type="button"
                        onClick={() => func.handlePageChange(param.page - 1)}
                        disabled={param.page <= 1}
                        className={paginationBlock.pageBtn({ disabled: param.page <= 1 })}
                        aria-label="Previous page"
                     >
                        <ChevronLeft className={icon.sm()} />
                     </button>

                     <span className={paginationBlock.pageIndicator()}>
                        Page {param.page} of {param.totalPages}
                     </span>

                     <button
                        type="button"
                        onClick={() => func.handlePageChange(param.page + 1)}
                        disabled={param.page >= param.totalPages}
                        className={paginationBlock.pageBtn({ disabled: param.page >= param.totalPages })}
                        aria-label="Next page"
                     >
                        <ChevronRight className={icon.sm()} />
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {param.deleteTarget && (
            <div className={modalBlock.backdrop()}>
               <div
                  className={modalBlock.dialog()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-company-title"
               >
                  <div className={modalBlock.header()}>
                     <div className={modalBlock.dangerIconBox()}>
                        <AlertTriangle className={icon.md()} />
                     </div>
                     <div className={modalBlock.titleGroup()}>
                        <h2
                           id="delete-company-title"
                           className={modalBlock.title()}
                        >
                           Delete &ldquo;{param.deleteTarget.name}&rdquo;?
                        </h2>
                        <p className={modalBlock.description()}>
                           Are you sure you want to permanently delete{' '}
                           <span className={modalBlock.highlight()}>{param.deleteTarget.name}</span>? All linked events
                           and records may be affected. This action cannot be undone.
                        </p>
                     </div>
                  </div>

                  <div className={modalBlock.footer()}>
                     <button
                        type="button"
                        onClick={func.handleCancelDelete}
                        className={modalBlock.cancelBtn()}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={func.handleConfirmDelete}
                        disabled={param.isPendingMutation}
                        className={modalBlock.confirmDeleteBtn({ disabled: param.isPendingMutation })}
                     >
                        {param.isPendingMutation && <Loader2 className={icon.spin()} />}
                        Delete Company
                     </button>
                  </div>
               </div>
            </div>
         )}

         {param.isBulkDeleteOpen && (
            <div className={modalBlock.backdrop()}>
               <div
                  className={modalBlock.dialog()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="bulk-delete-company-title"
               >
                  <div className={modalBlock.header()}>
                     <div className={modalBlock.dangerIconBox()}>
                        <AlertTriangle className={icon.md()} />
                     </div>
                     <div className={modalBlock.titleGroup()}>
                        <h2
                           id="bulk-delete-company-title"
                           className={modalBlock.title()}
                        >
                           Delete {param.selectedIds.length} selected companies?
                        </h2>
                        <p className={modalBlock.description()}>
                           Are you sure you want to permanently delete{' '}
                           <span className={modalBlock.highlight()}>{param.selectedIds.length} companies</span>? This
                           action cannot be undone.
                        </p>
                     </div>
                  </div>

                  <div className={modalBlock.footer()}>
                     <button
                        type="button"
                        onClick={func.handleCancelBulkDelete}
                        className={modalBlock.cancelBtn()}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={func.handleConfirmBulkDelete}
                        disabled={param.isPendingMutation}
                        className={modalBlock.confirmDeleteBtn({ disabled: param.isPendingMutation })}
                     >
                        {param.isPendingMutation && <Loader2 className={icon.spin()} />}
                        Delete Selected
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
