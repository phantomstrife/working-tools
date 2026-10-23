import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { create } from '@/modules/admin/services/lucky-draw/prize/create';
import { deleteById } from '@/modules/admin/services/lucky-draw/prize/delete-by-id';
import { update } from '@/modules/admin/services/lucky-draw/prize/update';

import type { PrizeRow } from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type PrizeStockFilter = 'ALL' | 'IN_STOCK' | 'DEPLETED';

export const prizeQuickSchema = z
   .object({
      name: z.string().trim().min(2, 'Prize name must be at least 2 characters.'),
      description: z.string().trim().optional().or(z.literal('')),
      image_url: z.string().trim().optional().or(z.literal('')),
      tier_order: z.number().int().min(1, 'Tier order must be 1 or higher.'),
      total_quantity: z.number().int().min(1, 'Total quantity must be at least 1.'),
      remaining_quantity: z.number().int().min(0, 'Remaining quantity cannot be negative.'),
   })
   .refine((values) => values.remaining_quantity <= values.total_quantity, {
      message: 'Remaining quantity cannot exceed total quantity.',
      path: ['remaining_quantity'],
   });

export type PrizeQuickFormValues = z.infer<typeof prizeQuickSchema>;

export type PrizesPanelProps = {
   gameId: string;
   prizes: PrizeRow[];
   isLoading: boolean;
   onRefresh: () => Promise<void>;
};

const CSV_INPUT_ID = 'overview-prize-csv-upload-input';

export function useLogic(props: PrizesPanelProps) {
   const { gameId, prizes, isLoading, onRefresh } = props;

   const [searchQuery, setSearchQuery] = useState('');
   const [stockFilter, setStockFilter] = useState<PrizeStockFilter>('ALL');

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingPrize, setEditingPrize] = useState<PrizeRow | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<PrizeRow | null>(null);

   const [isPending, startTransition] = useTransition();

   const form = useForm<PrizeQuickFormValues>({
      resolver: zodResolver(prizeQuickSchema),
      defaultValues: {
         name: '',
         description: '',
         image_url: '',
         tier_order: 1,
         total_quantity: 1,
         remaining_quantity: 1,
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = form;

   const filteredPrizes = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();

      return prizes.filter((item) => {
         if (normalizedSearch) {
            const matchesName = item.name.toLowerCase().includes(normalizedSearch);
            const matchesDesc = (item.description ?? '').toLowerCase().includes(normalizedSearch);
            if (!matchesName && !matchesDesc) {
               return false;
            }
         }

         if (stockFilter === 'IN_STOCK') {
            return item.remaining_quantity > 0;
         }
         if (stockFilter === 'DEPLETED') {
            return item.remaining_quantity === 0;
         }
         return true;
      });
   }, [prizes, searchQuery, stockFilter]);

   function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSearchQuery(event.target.value);
   }

   function handleClearSearch() {
      setSearchQuery('');
   }

   function handleStockFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const val = event.target.value;
      if (val === 'ALL' || val === 'IN_STOCK' || val === 'DEPLETED') {
         setStockFilter(val);
      }
   }

   function handleOpenCreateModal() {
      const nextTierOrder = prizes.length > 0 ? Math.max(...prizes.map((p) => p.tier_order)) + 1 : 1;
      setEditingPrize(null);
      reset({
         name: '',
         description: '',
         image_url: '',
         tier_order: nextTierOrder,
         total_quantity: 1,
         remaining_quantity: 1,
      });
      setIsModalOpen(true);
   }

   function handleOpenEditModal(prizeItem: PrizeRow) {
      setEditingPrize(prizeItem);
      reset({
         name: prizeItem.name,
         description: prizeItem.description ?? '',
         image_url: prizeItem.image_url ?? '',
         tier_order: prizeItem.tier_order,
         total_quantity: prizeItem.total_quantity,
         remaining_quantity: prizeItem.remaining_quantity,
      });
      setIsModalOpen(true);
   }

   function handleCloseModal() {
      if (isPending) return;
      setIsModalOpen(false);
      setEditingPrize(null);
   }

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            if (editingPrize) {
               await update({
                  id: editingPrize.id,
                  prize: {
                     name: values.name,
                     description: values.description || null,
                     image_url: values.image_url || null,
                     tier_order: values.tier_order,
                     total_quantity: values.total_quantity,
                     remaining_quantity: values.remaining_quantity,
                     updated_at: new Date().toISOString(),
                  },
               });
               toast.success(`Updated prize "${values.name}".`);
            } else {
               await create({
                  prize: {
                     game_id: gameId,
                     name: values.name,
                     description: values.description || null,
                     image_url: values.image_url || null,
                     tier_order: values.tier_order,
                     total_quantity: values.total_quantity,
                     remaining_quantity: values.remaining_quantity,
                  },
               });
               toast.success(`Created prize "${values.name}".`);
            }
            setIsModalOpen(false);
            setEditingPrize(null);
            await onRefresh();
         } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save prize.';
            form.setError('root', { message });
            toast.error(message);
         }
      });
   });

   function handlePromptDelete(prizeItem: PrizeRow) {
      setDeleteTarget(prizeItem);
   }

   function handleCancelDelete() {
      setDeleteTarget(null);
   }

   function handleConfirmDelete() {
      if (!deleteTarget) return;
      const target = deleteTarget;
      startTransition(async () => {
         try {
            await deleteById({ id: target.id });
            toast.success(`Deleted prize "${target.name}".`);
            setDeleteTarget(null);
            await onRefresh();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete prize.');
         }
      });
   }

   function handleTriggerImportCsv() {
      const inputEl = document.getElementById(CSV_INPUT_ID);
      if (inputEl instanceof HTMLInputElement) {
         inputEl.click();
      }
   }

   function handleImportCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse<Record<string, string>>(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => {
            const rows = results.data;
            if (rows.length === 0) {
               toast.error('The selected CSV file is empty.');
               event.target.value = '';
               return;
            }

            startTransition(async () => {
               let importedCount = 0;
               try {
                  for (const [idx, row] of rows.entries()) {
                     const name = (row.name ?? row.Name ?? '').trim();
                     if (!name) continue;
                     const tierOrder = Math.max(
                        1,
                        Number(row.tier_order ?? row.tier ?? String(idx + 1)) || idx + 1,
                     );
                     const totalQuantity = Math.max(
                        1,
                        Number(row.total_quantity ?? row.quantity ?? '1') || 1,
                     );
                     const remainingQuantity = Math.min(
                        totalQuantity,
                        Math.max(0, Number(row.remaining_quantity ?? String(totalQuantity)) || totalQuantity),
                     );

                     await create({
                        prize: {
                           game_id: gameId,
                           name,
                           description: (row.description ?? '').trim() || null,
                           image_url: (row.image_url ?? '').trim() || null,
                           tier_order: tierOrder,
                           total_quantity: totalQuantity,
                           remaining_quantity: remainingQuantity,
                        },
                     });
                     importedCount += 1;
                  }

                  if (importedCount === 0) {
                     throw new Error('No valid prize rows found in CSV (requires a "name" column).');
                  }

                  toast.success(`Imported ${importedCount} prizes from CSV.`);
                  await onRefresh();
               } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Failed during prize CSV import.');
               } finally {
                  event.target.value = '';
               }
            });
         },
         error: (error) => {
            toast.error(`CSV Parse Error: ${error.message}`);
            event.target.value = '';
         },
      });
   }

   return {
      param: {
         isLoading,
         isPending,
         searchQuery,
         stockFilter,
         totalCount: prizes.length,
         filteredPrizes,
         isModalOpen,
         isEdit: Boolean(editingPrize),
         deleteTarget,
         isDirty,
         errors,
         csvInputId: CSV_INPUT_ID,
      },
      func: {
         register,
         handleSearchChange,
         handleClearSearch,
         handleStockFilterChange,
         handleOpenCreateModal,
         handleOpenEditModal,
         handleCloseModal,
         onSubmit,
         handlePromptDelete,
         handleCancelDelete,
         handleConfirmDelete,
         handleTriggerImportCsv,
         handleImportCsvFile,
      },
   };
}

