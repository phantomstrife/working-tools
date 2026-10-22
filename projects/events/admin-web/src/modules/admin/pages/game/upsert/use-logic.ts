import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/game/get-context';
import { getById } from '@/modules/admin/services/game/get-by-id';
import { create } from '@/modules/admin/services/game/create';
import { update } from '@/modules/admin/services/game/update';

import type { Json } from '@/adapters/supabase/type';
import type {
   CallerAccount,
   EventOption,
   StaffAccountOption,
} from '@/modules/admin/services/game/get-context/type';

function isJsonRecord(value: unknown): value is { [key: string]: Json | undefined } {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const gameSchema = z.object({
   name: z.string().trim().min(2, 'Game name must be at least 2 characters.'),
   event_id: z.string().trim().min(1, 'Please select an event.'),
   game_type: z.enum(['LUCKY_DRAW']),
   description: z.string().trim().optional().or(z.literal('')),
   status: z.enum(['PENDING', 'READY', 'LIVE', 'FINISHED']),
   is_dev_only: z.boolean(),
   config: z
      .string()
      .trim()
      .refine(
         (val) => {
            if (!val) return true;
            try {
               const parsed: unknown = JSON.parse(val);
               return isJsonRecord(parsed);
            } catch {
               return false;
            }
         },
         { message: 'Game config must be a valid JSON object (e.g., {"spinDurationMs": 5000}).' },
      ),
   assigned_account_ids: z.array(z.string()),
});

export type GameFormValues = z.infer<typeof gameSchema>;

export interface GameAuditMetadata {
   id: string;
   createdAt: string | null;
   updatedAt: string | null;
}

export function useLogic(gameIdProp?: string, initialData?: GameFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const gameId = gameIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = gameId ?? duplicateId;
   const isEdit = Boolean(gameId);

   const [isPending, startTransition] = useTransition();
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [events, setEvents] = useState<EventOption[]>([]);
   const [staffAccounts, setStaffAccounts] = useState<StaffAccountOption[]>([]);
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<GameAuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);
   const isSuperAdmin = caller?.role !== 'ADMIN';

   const form = useForm<GameFormValues>({
      resolver: zodResolver(gameSchema),
      defaultValues: initialData ?? {
         name: '',
         event_id: '',
         game_type: 'LUCKY_DRAW',
         description: '',
         status: 'PENDING',
         is_dev_only: false,
         config: '{}',
         assigned_account_ids: [],
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      getValues,
      control,
      formState: { errors, isDirty, isValid },
   } = form;

   const selectedEventId = useWatch({ control, name: 'event_id' });
   const selectedStaffIds = useWatch({ control, name: 'assigned_account_ids' }) ?? [];

   const selectedEvent = events.find((evt) => evt.id === selectedEventId) ?? null;
   const availableStaff = selectedEvent
      ? staffAccounts.filter((acc) => acc.company_id === selectedEvent.company_id)
      : staffAccounts;

   useEffect(() => {
      let isMounted = true;
      getContext()
         .then((res) => {
            if (!isMounted) return;
            setCaller(res.caller);
            setEvents(res.events);
            setStaffAccounts(res.staffAccounts);

            if (!targetId && res.events.length > 0) {
               setValue('event_id', res.events[0].id, { shouldDirty: false });
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
         .then(({ game, assignedAccountIds }) => {
            if (!isMounted) return;

            const formattedConfig =
               game.config && typeof game.config === 'object'
                  ? JSON.stringify(game.config, null, 3)
                  : '{}';

            const mappedValues: GameFormValues = {
               name: duplicateId ? `${game.name} (Copy)` : game.name,
               event_id: game.event_id,
               game_type: game.game_type,
               description: game.description ?? '',
               status: game.status ?? 'PENDING',
               is_dev_only: Boolean(game.is_dev_only),
               config: formattedConfig,
               assigned_account_ids: assignedAccountIds,
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: game.id,
                  createdAt: game.created_at,
                  updatedAt: game.updated_at,
               });
            }
         })
         .catch((err: unknown) => {
            if (!isMounted) return;
            const message = err instanceof Error ? err.message : 'Failed to load game details.';
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

   function handleToggleStaffAccount(accountId: string) {
      const current = getValues('assigned_account_ids') ?? [];
      const next = current.includes(accountId)
         ? current.filter((id) => id !== accountId)
         : [...current, accountId];

      setValue('assigned_account_ids', next, { shouldDirty: true, shouldValidate: true });
   }

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            let parsedConfig: Json = {};
            if (values.config.trim()) {
               const rawParsed: unknown = JSON.parse(values.config);
               if (isJsonRecord(rawParsed)) {
                  parsedConfig = rawParsed;
               }
            }

            const normalizedPayload = {
               name: values.name,
               event_id: values.event_id,
               game_type: values.game_type,
               description: values.description || null,
               status: values.status,
               is_dev_only: isSuperAdmin ? values.is_dev_only : false,
               config: parsedConfig,
            };

            if (isEdit && gameId) {
               const updatedAt = new Date().toISOString();
               await update({
                  id: gameId,
                  game: {
                     ...normalizedPayload,
                     updated_at: updatedAt,
                  },
                  assignedAccountIds: values.assigned_account_ids,
               });
               reset(values);
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Game updated successfully.');
            } else {
               await create({
                  game: normalizedPayload,
                  assignedAccountIds: values.assigned_account_ids,
               });
               toast.success('Game created successfully.');
               router.push(ROUTE.ADMIN.GAME.SEARCH);
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

      router.push(ROUTE.ADMIN.GAME.SEARCH);
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
         isSuperAdmin,
         caller,
         events,
         availableStaff,
         selectedStaffIds,
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
         handleToggleStaffAccount,
         reset,
         formatTimestamp,
      },
   };
}

