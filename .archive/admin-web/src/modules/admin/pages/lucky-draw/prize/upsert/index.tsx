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

const PageAdminLuckyDrawPrizeUpsertContent = () => {
   const { param, func } = useLogic();
   const { wrapper, previewBox, previewThumb, previewImg, previewMeta, previewTitle, previewHint } = useStyle;

   if (param.isLoadingInitial) {
      return <UpsertSkeleton cardCount={2} />;
   }

   const auditItems =
      param.isEdit && param.auditMeta
         ? [
              { label: 'Prize ID', value: param.auditMeta.id },
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
            title={param.isEdit ? 'Edit Lucky Draw Prize' : 'Create Lucky Draw Prize'}
            subtitle={
               param.isEdit
                  ? 'Update prize details, tier rank, and remaining stock.'
                  : 'Define a new prize tier and quantity for a Lucky Draw game.'
            }
            saveLabel={param.isEdit ? 'Save Changes' : 'Create Prize'}
            backAriaLabel="Back to prizes"
            isDirty={param.isDirty}
            isPending={param.isPending}
            onCancel={func.handleCancel}
         />

         <UpsertErrorBanner message={param.loadError} />
         <UpsertErrorBanner message={param.errors.root?.message} />

         <UpsertSectionCard
            title="Prize Identity & Game Binding"
            description="Bind this prize to a Lucky Draw game and define its display information."
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
               id="name"
               label="Prize Name"
               required
               error={param.errors.name?.message}
            >
               <input
                  id="name"
                  type="text"
                  placeholder='e.g., Grand Prize — MacBook Pro 16"'
                  className={formControlStyle.input({ hasError: Boolean(param.errors.name) })}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="image_url"
               label="Prize Image URL"
               fullSpan
               hint="Optional high-resolution image URL displayed on the live presentation stage."
               error={param.errors.image_url?.message}
            >
               <input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/prizes/macbook-pro.webp"
                  className={formControlStyle.input({ hasError: Boolean(param.errors.image_url) })}
                  {...func.register('image_url')}
               />
            </FormField>

            {param.imageUrlPreview.trim() && (
               <div className={previewBox()}>
                  <div className={previewThumb()}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                        src={param.imageUrlPreview}
                        alt="Prize preview"
                        className={previewImg()}
                     />
                  </div>
                  <div className={previewMeta()}>
                     <span className={previewTitle()}>Stage Artwork Preview</span>
                     <span className={previewHint()}>
                        Rendered on the live Lucky Draw screen when this tier is active.
                     </span>
                  </div>
               </div>
            )}

            <FormField
               id="description"
               label="Prize Description"
               fullSpan
               error={param.errors.description?.message}
            >
               <textarea
                  id="description"
                  rows={3}
                  placeholder="Specifications, sponsor notes, or redemption instructions..."
                  className={formControlStyle.textarea({ hasError: Boolean(param.errors.description) })}
                  {...func.register('description')}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertSectionCard
            title="Tier Order & Inventory Rules"
            description="Control the draw order and enforce strict prize quantity boundaries (total_quantity >= 1)."
         >
            <FormField
               id="tier_order"
               label="Tier Order (1 = Highest / Grand Prize)"
               required
               hint="Lower numbers represent higher-tier prizes (e.g., 1 = First Prize, 2 = Second Prize)."
               error={param.errors.tier_order?.message}
            >
               <input
                  id="tier_order"
                  type="number"
                  min={1}
                  step={1}
                  className={formControlStyle.input({ hasError: Boolean(param.errors.tier_order) })}
                  {...func.register('tier_order', { valueAsNumber: true })}
               />
            </FormField>

            <FormField
               id="total_quantity"
               label="Total Quantity"
               required
               hint="Must be at least 1."
               error={param.errors.total_quantity?.message}
            >
               <input
                  id="total_quantity"
                  type="number"
                  min={1}
                  step={1}
                  className={formControlStyle.input({ hasError: Boolean(param.errors.total_quantity) })}
                  {...func.register('total_quantity', { valueAsNumber: true })}
               />
            </FormField>

            <FormField
               id="remaining_quantity"
               label="Remaining Quantity"
               required
               hint="Automatically decremented as winners are drawn on stage (0 <= remaining <= total)."
               error={param.errors.remaining_quantity?.message}
            >
               <input
                  id="remaining_quantity"
                  type="number"
                  min={0}
                  step={1}
                  className={formControlStyle.input({ hasError: Boolean(param.errors.remaining_quantity) })}
                  {...func.register('remaining_quantity', { valueAsNumber: true })}
               />
            </FormField>
         </UpsertSectionCard>

         <UpsertAuditFooter items={auditItems} />
      </form>
   );
};

export const PageAdminLuckyDrawPrizeUpsert: Router_Page = () => (
   <Suspense fallback={<UpsertSkeleton cardCount={2} />}>
      <PageAdminLuckyDrawPrizeUpsertContent />
   </Suspense>
);
