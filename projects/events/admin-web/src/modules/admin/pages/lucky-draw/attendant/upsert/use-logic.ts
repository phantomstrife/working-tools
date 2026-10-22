import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { create } from '@/modules/admin/services/lucky-draw/attendant/create';
import { getById } from '@/modules/admin/services/lucky-draw/attendant/get-by-id';
import { getContext } from '@/modules/admin/services/lucky-draw/attendant/get-context';
import { update } from '@/modules/admin/services/lucky-draw/attendant/update';

import type { Json } from '@/adapters/supabase/type';
import type { CallerAccount, GameOption } from '@/modules/admin/services/lucky-draw/attendant/get-context/type';

function isJsonRecord(value: unknown): value is { [key: string]: Json | undefined } {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const attendantSchema = z.object({
   game_id: z.string().trim().min(1, 'Please select a Lucky Draw game.'),
   full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
   ticket_code: z.string().trim().min(1, 'Ticket code is required.'),
   email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
   phone: z.string().trim().optional().or(z.literal('')),
   company_name: z.string().trim().optional().or(z.literal('')),
   department: z.string().trim().optional().or(z.literal('')),
   qr_code_payload: z.string().trim().optional().or(z.literal('')),
   email_status: z.enum(['NOT_SENT', 'SENDING', 'SENT', 'FAILED']),
   is_checked_in: z.boolean(),
   has_won: z.boolean(),
   custom_metadata: z
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
         { message: 'Custom metadata must be a valid JSON object (e.g., {"table": "VIP-1"}).' },
      ),
});

export type AttendantFormValues = z.infer<typeof attendantSchema>;

export interface AttendantAuditMetadata {
   id: string;
   createdAt: string | null;
   updatedAt: string | null;
   checkedInAt: string | null;
   emailSentAt: string | null;
}

export function useLogic(attendantIdProp?: string, initialData?: AttendantFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const attendantId = attendantIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = attendantId ?? duplicateId;
   const isEdit = Boolean(attendantId);

   const [isPending, startTransition] = useTransition();
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [games, setGames] = useState<GameOption[]>([]);
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<AttendantAuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);

   const form = useForm<AttendantFormValues>({
      resolver: zodResolver(attendantSchema),
      defaultValues: initialData ?? {
         game_id: '',
         full_name: '',
         ticket_code: '',
         email: '',
         phone: '',
         company_name: '',
         department: '',
         qr_code_payload: '',
         email_status: 'NOT_SENT',
         is_checked_in: false,
         has_won: false,
         custom_metadata: '{}',
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isDirty, isValid },
   } = form;

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
         .then((attendant) => {
            if (!isMounted) return;

            const formattedMeta =
               attendant.custom_metadata && typeof attendant.custom_metadata === 'object'
                  ? JSON.stringify(attendant.custom_metadata, null, 3)
                  : '{}';

            const mappedValues: AttendantFormValues = {
               game_id: attendant.game_id,
               full_name: duplicateId ? `${attendant.full_name} (Copy)` : attendant.full_name,
               ticket_code: duplicateId ? `${attendant.ticket_code}-COPY` : attendant.ticket_code,
               email: attendant.email ?? '',
               phone: attendant.phone ?? '',
               company_name: attendant.company_name ?? '',
               department: attendant.department ?? '',
               qr_code_payload: duplicateId ? '' : attendant.qr_code_payload,
               email_status: duplicateId ? 'NOT_SENT' : (attendant.email_status ?? 'NOT_SENT'),
               is_checked_in: duplicateId ? false : Boolean(attendant.is_checked_in),
               has_won: duplicateId ? false : Boolean(attendant.has_won),
               custom_metadata: formattedMeta,
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: attendant.id,
                  createdAt: attendant.created_at,
                  updatedAt: attendant.updated_at,
                  checkedInAt: attendant.checked_in_at,
                  emailSentAt: attendant.email_sent_at,
               });
            }
         })
         .catch((err: unknown) => {
            if (!isMounted) return;
            const message = err instanceof Error ? err.message : 'Failed to load attendant details.';
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
            let parsedMetadata: Json = {};
            if (values.custom_metadata.trim()) {
               const rawParsed: unknown = JSON.parse(values.custom_metadata);
               if (isJsonRecord(rawParsed)) {
                  parsedMetadata = rawParsed;
               }
            }

            if (isEdit && attendantId) {
               const updatedAt = new Date().toISOString();
               await update({
                  id: attendantId,
                  attendant: {
                     game_id: values.game_id,
                     full_name: values.full_name,
                     ticket_code: values.ticket_code,
                     email: values.email || null,
                     phone: values.phone || null,
                     company_name: values.company_name || null,
                     department: values.department || null,
                     ...(values.qr_code_payload ? { qr_code_payload: values.qr_code_payload } : {}),
                     email_status: values.email_status,
                     is_checked_in: values.is_checked_in,
                     has_won: values.has_won,
                     custom_metadata: parsedMetadata,
                     updated_at: updatedAt,
                  },
               });
               reset(values);
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Attendant updated successfully.');
            } else {
               await create({
                  attendant: {
                     game_id: values.game_id,
                     full_name: values.full_name,
                     ticket_code: values.ticket_code,
                     email: values.email || null,
                     phone: values.phone || null,
                     company_name: values.company_name || null,
                     department: values.department || null,
                     qr_code_payload: values.qr_code_payload || undefined,
                     email_status: values.email_status,
                     is_checked_in: values.is_checked_in,
                     has_won: values.has_won,
                     custom_metadata: parsedMetadata,
                  },
               });
               toast.success('Attendant registered successfully.');
               router.push(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);
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

      router.push(ROUTE.ADMIN.LUCKY_DRAW.ATTENDANT.SEARCH);
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

