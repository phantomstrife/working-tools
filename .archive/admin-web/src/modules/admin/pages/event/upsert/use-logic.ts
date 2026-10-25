import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/event/get-context';
import { getById } from '@/modules/admin/services/event/get-by-id';
import { create } from '@/modules/admin/services/event/create';
import { update } from '@/modules/admin/services/event/update';

import type { Json } from '@/adapters/supabase/type';
import type { CallerAccount, CompanyOption } from '@/modules/admin/services/event/get-context/type';

function isJsonRecord(value: unknown): value is { [key: string]: Json | undefined } {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toDatetimeLocalValue(iso: string | null): string {
   if (!iso) return '';
   const date = new Date(iso);
   if (Number.isNaN(date.getTime())) return '';
   const offsetMs = date.getTimezoneOffset() * 60_000;
   return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoOrNull(localValue: string | undefined): string | null {
   if (!localValue || !localValue.trim()) return null;
   const date = new Date(localValue);
   if (Number.isNaN(date.getTime())) return null;
   return date.toISOString();
}

function slugify(value: string): string {
   return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
}

export const eventSchema = z.object({
   name: z.string().trim().min(2, 'Event name must be at least 2 characters.'),
   slug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters.')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only.'),
   company_id: z.string().trim().min(1, 'Please select a company.'),
   description: z.string().trim().optional().or(z.literal('')),
   location_name: z.string().trim().optional().or(z.literal('')),
   location_address: z.string().trim().optional().or(z.literal('')),
   start_time: z.string().trim().optional().or(z.literal('')),
   end_time: z.string().trim().optional().or(z.literal('')),
   banner_url: z.string().trim().url('Please enter a valid URL.').optional().or(z.literal('')),
   theme_config: z
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
         { message: 'Theme config must be a valid JSON object (e.g., {"primaryColor": "#0036e5"}).' },
      ),
   status: z.enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export interface EventAuditMetadata {
   id: string;
   createdAt: string | null;
   updatedAt: string | null;
}

export function useLogic(eventIdProp?: string, initialData?: EventFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const eventId = eventIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = eventId ?? duplicateId;
   const isEdit = Boolean(eventId);

   const [isPending, startTransition] = useTransition();
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [companies, setCompanies] = useState<CompanyOption[]>([]);
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<EventAuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);
   const isSuperAdmin = caller?.role !== 'ADMIN';

   const form = useForm<EventFormValues>({
      resolver: zodResolver(eventSchema),
      defaultValues: initialData ?? {
         name: '',
         slug: '',
         company_id: '',
         description: '',
         location_name: '',
         location_address: '',
         start_time: '',
         end_time: '',
         banner_url: '',
         theme_config: '{}',
         status: 'DRAFT',
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      getValues,
      formState: { errors, isDirty, isValid },
   } = form;

   useEffect(() => {
      let isMounted = true;
      getContext()
         .then((res) => {
            if (!isMounted) return;
            setCaller(res.caller);
            setCompanies(res.companies);

            if (!targetId) {
               const defaultCompanyId =
                  res.caller?.role === 'ADMIN'
                     ? (res.caller.company_id ?? '')
                     : (res.companies[0]?.id ?? '');

               if (defaultCompanyId) {
                  setValue('company_id', defaultCompanyId, { shouldDirty: false });
               }
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
         .then(({ event }) => {
            if (!isMounted) return;

            const formattedTheme =
               event.theme_config && typeof event.theme_config === 'object'
                  ? JSON.stringify(event.theme_config, null, 3)
                  : '{}';

            const mappedValues: EventFormValues = {
               name: duplicateId ? `${event.name} (Copy)` : event.name,
               slug: duplicateId ? `${event.slug}-copy` : event.slug,
               company_id: event.company_id,
               description: event.description ?? '',
               location_name: event.location_name ?? '',
               location_address: event.location_address ?? '',
               start_time: toDatetimeLocalValue(event.start_time),
               end_time: toDatetimeLocalValue(event.end_time),
               banner_url: event.banner_url ?? '',
               theme_config: formattedTheme,
               status: event.status ?? 'DRAFT',
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: event.id,
                  createdAt: event.created_at,
                  updatedAt: event.updated_at,
               });
            }
         })
         .catch((err: unknown) => {
            if (!isMounted) return;
            const message = err instanceof Error ? err.message : 'Failed to load event details.';
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

   function handleGenerateSlug() {
      const currentName = getValues('name');
      const generated = slugify(currentName);
      if (generated) {
         setValue('slug', generated, { shouldDirty: true, shouldValidate: true });
      }
   }

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            let parsedTheme: Json = {};
            if (values.theme_config.trim()) {
               const rawParsed: unknown = JSON.parse(values.theme_config);
               if (isJsonRecord(rawParsed)) {
                  parsedTheme = rawParsed;
               }
            }

            const resolvedCompanyId = isSuperAdmin
               ? values.company_id
               : (caller?.company_id ?? values.company_id);

            const normalizedPayload = {
               name: values.name,
               slug: values.slug,
               company_id: resolvedCompanyId,
               description: values.description || null,
               location_name: values.location_name || null,
               location_address: values.location_address || null,
               start_time: toIsoOrNull(values.start_time),
               end_time: toIsoOrNull(values.end_time),
               banner_url: values.banner_url || null,
               theme_config: parsedTheme,
               status: values.status,
            };

            if (isEdit && eventId) {
               const updatedAt = new Date().toISOString();
               await update({
                  id: eventId,
                  event: {
                     ...normalizedPayload,
                     updated_at: updatedAt,
                  },
               });
               reset(values);
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Event updated successfully.');
            } else {
               await create({
                  event: normalizedPayload,
               });
               toast.success('Event created successfully.');
               router.push(ROUTE.ADMIN.EVENT.SEARCH);
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

      router.push(ROUTE.ADMIN.EVENT.SEARCH);
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
         companies,
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
         handleGenerateSlug,
         reset,
         formatTimestamp,
      },
   };
}

