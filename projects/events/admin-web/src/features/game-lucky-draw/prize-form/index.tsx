'use client';

import { Award, FileText, Gift, Image, Layers, PackageCheck } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';
import { modalFormStyle } from '@admin-web/components/modal/form-style';

import { useLogic } from './use-logic';

import type * as Types from './type';

export const PrizeForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, full_span, footer } = modalFormStyle;

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

