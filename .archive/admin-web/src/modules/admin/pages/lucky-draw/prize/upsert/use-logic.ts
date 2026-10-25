import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { create } from '@/modules/admin/services/lucky-draw/prize/create';
import { getById } from '@/modules/admin/services/lucky-draw/prize/get-by-id';
import { getContext } from '@/modules/admin/services/lucky-draw/prize/get-context';
import { update } from '@/modules/admin/services/lucky-draw/prize/update';

import type { CallerAccount, GameOption } from '@/modules/admin/services/lucky-draw/prize/get-context/type';

export const prizeSchema = z
   .object({
      game_id: z.string().trim().min(1, 'Please select a Lucky Draw game.'),
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

export type PrizeFormValues = z.infer<typeof prizeSchema>;

export interface PrizeAuditMetadata {
   id: string;
   createdAt: string | null;
   updatedAt: string | null;
}

export function useLogic(prizeIdProp?: string, initialData?: PrizeFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const prizeId = prizeIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = prizeId ?? duplicateId;
   const isEdit = Boolean(prizeId);

   const [isPending, startTransition] = useTransition();
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [games, setGames] = useState<GameOption[]>([]);
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<PrizeAuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);

   const form = useForm<PrizeFormValues>({
      resolver: zodResolver(prizeSchema),
      defaultValues: initialData ?? {
         game_id: '',
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
      setValue,
      control,
      formState: { errors, isDirty, isValid },
   } = form;

   const imageUrlPreview = useWatch({ control, name: 'image_url' }) ?? '';

   useEffect(() => {
      let isMounted = true;
      getContext()
         .then((res) => {
            if (!isMounted) return;
            setCaller(res.caller);
            setGames(res.games);

            if (!targetId && res.games.length > 0) {
               setValue('game_id', res.games[0].id, { shouldDirty: false });
            }
         })
         .catch(() => {
            // Non-blocking context fetch
         });

      return () => {
         isMounted = false;
      };
   }, [setValue, targetId]);

   useEffect(() => {
      if (!targetId) {
         return;
      }

      let isMounted = true;

      getById({ id: targetId })
         .then((prize) => {
            if (!isMounted) return;

            const mappedValues: PrizeFormValues = {
               game_id: prize.game_id,
               name: duplicateId ? `${prize.name} (Copy)` : prize.name,
               description: prize.description ?? '',
               image_url: prize.image_url ?? '',
               tier_order: prize.tier_order,
               total_quantity: prize.total_quantity,
               remaining_quantity: duplicateId ? prize.total_quantity : prize.remaining_quantity,
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: prize.id,
                  createdAt: prize.created_at,
                  updatedAt: prize.updated_at,
               });
            }
         })
         .catch((err: unknown) => {
            if (!isMounted) return;
            const message = err instanceof Error ? err.message : 'Failed to load prize details.';
            setLoadError(message);
            toast.error(message);
         })
         .finally(() => {
            if (isMounted) {
               setLoadedTargetId(targetId);
            }
         });

      return () => {
         isMounted = false;
      };
   }, [targetId, duplicateId, reset]);

   useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
         if (isDirty) {
            event.preventDefault();
         }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
         window.removeEventListener('beforeunload', handleBeforeUnload);
      };
   }, [isDirty]);

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            const normalizedPayload = {
               game_id: values.game_id,
               name: values.name,
               description: values.description || null,
               image_url: values.image_url || null,
               tier_order: values.tier_order,
               total_quantity: values.total_quantity,
               remaining_quantity: values.remaining_quantity,
            };

            if (isEdit && prizeId) {
               const updatedAt = new Date().toISOString();
               await update({
                  id: prizeId,
                  prize: {
                     ...normalizedPayload,
                     updated_at: updatedAt,
                  },
               });
               reset(values);
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Prize updated successfully.');
            } else {
               await create({
                  prize: normalizedPayload,
               });
               toast.success('Prize created successfully.');
               router.push(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.SEARCH);
            }
         } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            form.setError('root', { message });
            toast.error(message);
         }
      });
   });

   function handleCancel() {
      if (isDirty) {
         const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
         if (!confirmed) {
            return;
         }
      }

      router.push(ROUTE.ADMIN.LUCKY_DRAW.PRIZE.SEARCH);
   }

   function formatTimestamp(iso: string | null): string {
      if (!iso) return '—';
      const parsed = new Date(iso);
      if (Number.isNaN(parsed.getTime())) return iso;
      return parsed.toLocaleString();
   }

   return {
      param: {
         isEdit,
         caller,
         games,
         imageUrlPreview,
         isPending,
         isLoadingInitial,
         loadError,
         isDirty,
         isValid,
         errors,
         auditMeta,
      },
      func: {
         register,
         onSubmit,
         handleCancel,
         reset,
         formatTimestamp,
      },
   };
}

