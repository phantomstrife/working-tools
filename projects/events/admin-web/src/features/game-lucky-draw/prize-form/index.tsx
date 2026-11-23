'use client';

import {
   ArrowDown,
   ArrowUp,
   Award,
   FileText,
   Gift,
   Image,
   Layers,
   ListOrdered,
   Loader2,
   PackageCheck,
   Plus,
   Search,
   X,
} from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const PrizeForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, full_span, designated, footer } = useStyle;

   const totalQuantityField = func.register('total_quantity', { valueAsNumber: true });

   return (
      <form
         className={form}
         onSubmit={func.onSubmit}
      >
         <div className={grid}>
            <FormField
               id="prize-name"
               Icon={Gift}
               label={func.translate('fields.name.label')}
               required
               error={param.errors.name?.message}
            >
               <input
                  id="prize-name"
                  type="text"
                  placeholder={func.translate('fields.name.placeholder')}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="prize-tier-order"
               Icon={Award}
               label={func.translate('fields.tier_order.label')}
               required
               error={param.errors.tier_order?.message}
            >
               <input
                  id="prize-tier-order"
                  type="number"
                  min={1}
                  placeholder={func.translate('fields.tier_order.placeholder')}
                  {...func.register('tier_order', { valueAsNumber: true })}
               />
            </FormField>

            <FormField
               id="prize-total-quantity"
               Icon={Layers}
               label={func.translate('fields.total_quantity.label')}
               required
               error={param.errors.total_quantity?.message}
            >
               <input
                  id="prize-total-quantity"
                  type="number"
                  min={1}
                  placeholder={func.translate('fields.total_quantity.placeholder')}
                  {...totalQuantityField}
                  onChange={(event) => {
                     void totalQuantityField.onChange(event);
                     func.handleTotalQuantityChange(event);
                  }}
               />
            </FormField>

            <FormField
               id="prize-remaining-quantity"
               Icon={PackageCheck}
               label={func.translate('fields.remaining_quantity.label')}
               required
               error={param.errors.remaining_quantity?.message}
            >
               <input
                  id="prize-remaining-quantity"
                  type="number"
                  min={0}
                  disabled={param.mode === 'create'}
                  placeholder={func.translate('fields.remaining_quantity.placeholder')}
                  {...func.register('remaining_quantity', { valueAsNumber: true })}
               />
            </FormField>

            <FormField
               id="prize-image-url"
               className={full_span}
               Icon={Image}
               label={func.translate('fields.image_url.label')}
               error={param.errors.image_url?.message}
            >
               <input
                  id="prize-image-url"
                  type="url"
                  placeholder={func.translate('fields.image_url.placeholder')}
                  {...func.register('image_url')}
               />
            </FormField>

            <FormField
               id="prize-description"
               className={full_span}
               Icon={FileText}
               label={func.translate('fields.description.label')}
               error={param.errors.description?.message}
            >
               <input
                  id="prize-description"
                  type="text"
                  placeholder={func.translate('fields.description.placeholder')}
                  {...func.register('description')}
               />
            </FormField>

            <div className={designated.section}>
               <div className={designated.header}>
                  <div className={designated.title_row}>
                     <ListOrdered
                        size={15}
                        className={designated.title_icon}
                     />
                     <span>{func.translate('fields.designated_attendants.label')}</span>
                     {param.rankedCandidates.length > 0 && (
                        <span className={designated.count_badge}>
                           {func.translate('fields.designated_attendants.selected_count', {
                              count: param.rankedCandidates.length,
                           })}
                        </span>
                     )}
                  </div>

                  {param.rankedCandidates.length > 0 && (
                     <button
                        type="button"
                        onClick={func.handleClearDesignatedAttendants}
                        className={designated.clear_all_button}
                     >
                        {func.translate('fields.designated_attendants.clear_all')}
                     </button>
                  )}
               </div>

               <p className={designated.helper}>{func.translate('fields.designated_attendants.helper')}</p>

               {param.rankedCandidates.length === 0 ? (
                  <div className={designated.empty}>{func.translate('fields.designated_attendants.empty')}</div>
               ) : (
                  <div className={designated.ranked_list}>
                     {param.rankedCandidates.map((item, index) => {
                        const isFirst = index === 0;
                        const isLast = index === param.rankedCandidates.length - 1;

                        return (
                           <div
                              key={item.id}
                              className={designated.ranked_item}
                           >
                              <div className={designated.item_main}>
                                 <span className={designated.rank_badge({ top: isFirst })}>#{item.rank}</span>
                                 <span className={designated.ticket_pill}>{item.ticketCode}</span>
                                 <div className={designated.guest_info}>
                                    <div className={designated.guest_name_row}>
                                       <span className={designated.guest_name}>{item.displayName}</span>
                                       <span className={designated.status_pill({ status: item.status })}>
                                          {func.translate(`fields.designated_attendants.status.${item.status}`)}
                                       </span>
                                    </div>
                                    {(item.representativeName || item.companyName) && (
                                       <span className={designated.guest_meta}>
                                          {[
                                             item.representativeName
                                                ? func.translate('fields.designated_attendants.representative_prefix', {
                                                     name: item.representativeName,
                                                  })
                                                : null,
                                             item.companyName,
                                          ]
                                             .filter(Boolean)
                                             .join(' · ')}
                                       </span>
                                    )}
                                 </div>
                              </div>

                              <div className={designated.controls}>
                                 <button
                                    type="button"
                                    disabled={isFirst}
                                    title={func.translate('fields.designated_attendants.actions.move_up')}
                                    aria-label={func.translate('fields.designated_attendants.actions.move_up')}
                                    onClick={() => func.handleMoveDesignatedAttendant(index, 'up')}
                                    className={designated.order_button({ disabled: isFirst })}
                                 >
                                    <ArrowUp size={13} />
                                 </button>
                                 <button
                                    type="button"
                                    disabled={isLast}
                                    title={func.translate('fields.designated_attendants.actions.move_down')}
                                    aria-label={func.translate('fields.designated_attendants.actions.move_down')}
                                    onClick={() => func.handleMoveDesignatedAttendant(index, 'down')}
                                    className={designated.order_button({ disabled: isLast })}
                                 >
                                    <ArrowDown size={13} />
                                 </button>
                                 <button
                                    type="button"
                                    title={func.translate('fields.designated_attendants.actions.remove')}
                                    aria-label={func.translate('fields.designated_attendants.actions.remove')}
                                    onClick={() => func.handleRemoveDesignatedAttendant(item.id)}
                                    className={designated.remove_button}
                                 >
                                    <X size={13} />
                                 </button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}

               <div className={designated.picker_wrapper}>
                  <div className={designated.search_box}>
                     <Search
                        size={14}
                        className={designated.search_icon}
                     />
                     <input
                        type="text"
                        value={param.candidateSearch}
                        onChange={func.handleCandidateSearchChange}
                        onKeyDown={func.handleCandidateSearchKeyDown}
                        placeholder={func.translate('fields.designated_attendants.search_placeholder')}
                        className={designated.search_input}
                     />
                     {param.candidateSearch && (
                        <button
                           type="button"
                           title={func.translate('fields.designated_attendants.clear_search')}
                           aria-label={func.translate('fields.designated_attendants.clear_search')}
                           onClick={func.handleClearCandidateSearch}
                           className={designated.search_clear}
                        >
                           <X size={13} />
                        </button>
                     )}
                  </div>

                  {param.candidatesError ? (
                     <div className={designated.results_list}>
                        <div className={designated.results_error}>{param.candidatesError}</div>
                     </div>
                  ) : !param.hasCandidateSearch ? (
                     <div className={designated.search_prompt}>
                        {func.translate('fields.designated_attendants.search_prompt')}
                     </div>
                  ) : (
                     <div className={designated.results_list}>
                        {param.isLoadingCandidates ? (
                           <div className={designated.results_state}>
                              <Loader2 className={designated.spinner} />
                              <span>{func.translate('fields.designated_attendants.loading')}</span>
                           </div>
                        ) : param.totalCandidatesCount === 0 ? (
                           <div className={designated.results_state}>
                              {func.translate('fields.designated_attendants.no_candidates')}
                           </div>
                        ) : param.availableCandidates.length === 0 ? (
                           <div className={designated.results_state}>
                              {func.translate('fields.designated_attendants.no_search_results')}
                           </div>
                        ) : (
                           param.availableCandidates.map((candidate) => (
                              <button
                                 key={candidate.id}
                                 type="button"
                                 onClick={() => func.handleAddDesignatedAttendant(candidate.id)}
                                 className={designated.result_row}
                              >
                                 <div className={designated.item_main}>
                                    <span className={designated.ticket_pill}>{candidate.ticketCode}</span>
                                    <div className={designated.guest_info}>
                                       <div className={designated.guest_name_row}>
                                          <span className={designated.guest_name}>{candidate.displayName}</span>
                                          <span className={designated.status_pill({ status: candidate.status })}>
                                             {func.translate(`fields.designated_attendants.status.${candidate.status}`)}
                                          </span>
                                       </div>
                                       {(candidate.representativeName || candidate.companyName) && (
                                          <span className={designated.guest_meta}>
                                             {[
                                                candidate.representativeName
                                                   ? func.translate('fields.designated_attendants.representative_prefix', {
                                                        name: candidate.representativeName,
                                                     })
                                                   : null,
                                                candidate.companyName,
                                             ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 <span
                                    title={func.translate('fields.designated_attendants.actions.add')}
                                    className={designated.add_icon_wrap}
                                 >
                                    <Plus size={13} />
                                 </span>
                              </button>
                           ))
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

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
