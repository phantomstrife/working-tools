'use client';

import { Gift, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';

import { ConfirmDeleteModal } from '@/components/search';
import { FormField, formControlStyle, UpsertErrorBanner } from '@/components/upsert';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { PrizesPanelProps } from './use-logic';

export const PrizesPanel = (props: PrizesPanelProps) => {
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
      prizeCell,
      thumbBox,
      thumbImg,
      prizeTextGroup,
      nameText,
      descText,
      tierBadge,
      stockBadge,
      rowActions,
      actionIconBtn,
      emptyState,
      skeletonRow,
      iconSm,
      iconMd,
      modal,
   } = useStyle;

   const isActionDisabled = param.isLoading || param.isPending;
   const isSaveDisabled = !param.isDirty || param.isPending;

   return (
      <>
         <div className={panel()}>
            <div className={header()}>
               <div className={titleGroup()}>
                  <h3 className={title()}>Prize Management</h3>
                  <span className={countPill()}>
                     {param.filteredPrizes.length} / {param.totalCount}
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
                     <span>Create Prize</span>
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
                     placeholder="Search prizes by name or description..."
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
                  aria-label="Filter prizes by stock"
                  value={param.stockFilter}
                  onChange={func.handleStockFilterChange}
                  className={filterSelect()}
               >
                  <option value="ALL">Stock: All Prizes</option>
                  <option value="IN_STOCK">Stock: In Stock (&gt; 0)</option>
                  <option value="DEPLETED">Stock: Depleted (0)</option>
               </select>
            </div>

            <div className={tableScroll()}>
               <table className={table()}>
                  <thead className={thead()}>
                     <tr>
                        <th className={th()}>Tier</th>
                        <th className={th()}>Prize</th>
                        <th className={th()}>Remaining / Total</th>
                        <th className={th()}>Stock Status</th>
                        <th className={thRight()}>Actions</th>
                     </tr>
                  </thead>
                  <tbody className={tbody()}>
                     {param.isLoading ? (
                        Array.from({ length: 3 }).map((_, rowIdx) => (
                           <tr
                              key={rowIdx}
                              className={tr()}
                           >
                              {Array.from({ length: 5 }).map((__, colIdx) => (
                                 <td
                                    key={colIdx}
                                    className={td()}
                                 >
                                    <div className={skeletonRow()} />
                                 </td>
                              ))}
                           </tr>
                        ))
                     ) : param.filteredPrizes.length === 0 ? (
                        <tr>
                           <td
                              colSpan={5}
                              className={emptyState()}
                           >
                              {param.totalCount === 0
                                 ? 'No prizes configured for this Lucky Draw game yet. Click "Create Prize" or "Import CSV" to add prizes.'
                                 : 'No prizes match your search or stock filter.'}
                           </td>
                        </tr>
                     ) : (
                        param.filteredPrizes.map((item) => {
                           const stockState =
                              item.remaining_quantity === 0
                                 ? 'DEPLETED'
                                 : item.remaining_quantity <= Math.ceil(item.total_quantity * 0.25)
                                   ? 'LOW_STOCK'
                                   : 'IN_STOCK';
                           const stockLabel =
                              stockState === 'DEPLETED'
                                 ? 'Depleted'
                                 : stockState === 'LOW_STOCK'
                                   ? 'Low Stock'
                                   : 'In Stock';

                           return (
                              <tr
                                 key={item.id}
                                 className={tr()}
                              >
                                 <td className={td()}>
                                    <span className={tierBadge()}>Tier #{item.tier_order}</span>
                                 </td>
                                 <td className={td()}>
                                    <div className={prizeCell()}>
                                       <div className={thumbBox()}>
                                          {item.image_url ? (
                                             // eslint-disable-next-line @next/next/no-img-element
                                             <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className={thumbImg()}
                                             />
                                          ) : (
                                             <Gift className={iconMd()} />
                                          )}
                                       </div>
                                       <div className={prizeTextGroup()}>
                                          <span className={nameText()}>{item.name}</span>
                                          <span className={descText()}>
                                             {item.description || 'No description'}
                                          </span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className={td()}>
                                    <span className={nameText()}>
                                       {item.remaining_quantity} / {item.total_quantity}
                                    </span>
                                 </td>
                                 <td className={td()}>
                                    <span className={stockBadge({ state: stockState })}>{stockLabel}</span>
                                 </td>
                                 <td className={tdRight()}>
                                    <div className={rowActions()}>
                                       <button
                                          type="button"
                                          title="Quick Edit Prize"
                                          aria-label={`Edit ${item.name}`}
                                          onClick={() => func.handleOpenEditModal(item)}
                                          className={actionIconBtn()}
                                       >
                                          <Pencil className={iconMd()} />
                                       </button>
                                       <button
                                          type="button"
                                          title="Delete Prize"
                                          aria-label={`Delete ${item.name}`}
                                          onClick={() => func.handlePromptDelete(item)}
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
               aria-labelledby="prize-quick-modal-title"
            >
               <form
                  className={modal.panel()}
                  onSubmit={func.onSubmit}
                  noValidate
               >
                  <div className={modal.header()}>
                     <h3
                        id="prize-quick-modal-title"
                        className={modal.headerTitle()}
                     >
                        {param.isEdit ? 'Quick Edit Prize' : 'Create Prize'}
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
                           id="prize-root-error"
                           label=""
                           fullSpan
                        >
                           <UpsertErrorBanner message={param.errors.root.message} />
                        </FormField>
                     )}

                     <FormField
                        id="prize-name"
                        label="Prize Name"
                        required
                        fullSpan
                        error={param.errors.name?.message}
                     >
                        <input
                           id="prize-name"
                           type="text"
                           placeholder="e.g., First Prize — iPhone 16 Pro"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                           {...func.register('name')}
                        />
                     </FormField>

                     <FormField
                        id="prize-tier"
                        label="Tier Order (1 = Highest)"
                        required
                        error={param.errors.tier_order?.message}
                     >
                        <input
                           id="prize-tier"
                           type="number"
                           min={1}
                           step={1}
                           className={formControlStyle.input({ hasError: Boolean(param.errors.tier_order) })}
                           {...func.register('tier_order', { valueAsNumber: true })}
                        />
                     </FormField>

                     <FormField
                        id="prize-total-qty"
                        label="Total Quantity"
                        required
                        error={param.errors.total_quantity?.message}
                     >
                        <input
                           id="prize-total-qty"
                           type="number"
                           min={1}
                           step={1}
                           className={formControlStyle.input({ hasError: Boolean(param.errors.total_quantity) })}
                           {...func.register('total_quantity', { valueAsNumber: true })}
                        />
                     </FormField>

                     <FormField
                        id="prize-remaining-qty"
                        label="Remaining Quantity"
                        required
                        error={param.errors.remaining_quantity?.message}
                     >
                        <input
                           id="prize-remaining-qty"
                           type="number"
                           min={0}
                           step={1}
                           className={formControlStyle.input({ hasError: Boolean(param.errors.remaining_quantity) })}
                           {...func.register('remaining_quantity', { valueAsNumber: true })}
                        />
                     </FormField>

                     <FormField
                        id="prize-image-url"
                        label="Image URL"
                        error={param.errors.image_url?.message}
                     >
                        <input
                           id="prize-image-url"
                           type="url"
                           placeholder="https://example.com/prize.webp"
                           className={formControlStyle.input({ hasError: Boolean(param.errors.image_url) })}
                           {...func.register('image_url')}
                        />
                     </FormField>

                     <FormField
                        id="prize-description"
                        label="Description"
                        fullSpan
                        error={param.errors.description?.message}
                     >
                        <textarea
                           id="prize-description"
                           rows={2}
                           placeholder="Prize details or sponsor notes..."
                           className={formControlStyle.textarea({ hasError: Boolean(param.errors.description) })}
                           {...func.register('description')}
                        />
                     </FormField>
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
                        {param.isPending ? 'Saving...' : param.isEdit ? 'Save Changes' : 'Create Prize'}
                     </button>
                  </div>
               </form>
            </div>
         )}

         <ConfirmDeleteModal
            isOpen={Boolean(param.deleteTarget)}
            title={param.deleteTarget ? `Delete "${param.deleteTarget.name}"?` : 'Delete Prize?'}
            entityName={param.deleteTarget?.name ?? ''}
            descriptionSuffix="All winner records associated with this prize will also be permanently deleted."
            confirmLabel="Delete Prize"
            isPending={param.isPending}
            onCancel={func.handleCancelDelete}
            onConfirm={func.handleConfirmDelete}
         />
      </>
   );
};

