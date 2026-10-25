import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getById } from '@/modules/admin/services/company/get-by-id';
import { create } from '@/modules/admin/services/company/create';
import { update } from '@/modules/admin/services/company/update';

export const companySchema = z.object({
   name: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
   tax_code: z.string().trim().optional().or(z.literal('')),
   industry: z.string().trim().optional().or(z.literal('')),
   address: z.string().trim().optional().or(z.literal('')),
   logo_url: z.string().trim().url('Please enter a valid URL.').optional().or(z.literal('')),
   contact_person: z.string().trim().optional().or(z.literal('')),
   contact_email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
   contact_phone: z.string().trim().optional().or(z.literal('')),
   status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export interface AuditMetadata {
   id: string;
   createdAt: string | null;
   updatedAt: string | null;
}

export function useLogic(companyIdProp?: string, initialData?: CompanyFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const companyId = companyIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = companyId ?? duplicateId;
   const isEdit = Boolean(companyId);

   const [isPending, startTransition] = useTransition();
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<AuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);

   const form = useForm<CompanyFormValues>({
      resolver: zodResolver(companySchema),
      defaultValues: initialData ?? {
         name: '',
         tax_code: '',
         industry: '',
         address: '',
         logo_url: '',
         contact_person: '',
         contact_email: '',
         contact_phone: '',
         status: 'ACTIVE',
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty, isValid },
   } = form;

   useEffect(() => {
      if (!targetId) {
         return;
      }

      let isMounted = true;

      getById({ id: targetId })
         .then(({ company }) => {
            if (!isMounted) return;

            const mappedValues: CompanyFormValues = {
               name: duplicateId ? `${company.name} (Copy)` : company.name,
               tax_code: company.tax_code ?? '',
               industry: company.industry ?? '',
               address: company.address ?? '',
               logo_url: company.logo_url ?? '',
               contact_person: company.contact_person ?? '',
               contact_email: company.contact_email ?? '',
               contact_phone: company.contact_phone ?? '',
               status: company.status ?? 'ACTIVE',
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: company.id,
                  createdAt: company.created_at,
                  updatedAt: company.updated_at,
               });
            }
         })
         .catch((error: unknown) => {
            if (!isMounted) return;
            const message = error instanceof Error ? error.message : 'Failed to load company details.';
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
               name: values.name,
               tax_code: values.tax_code || null,
               industry: values.industry || null,
               address: values.address || null,
               logo_url: values.logo_url || null,
               contact_person: values.contact_person || null,
               contact_email: values.contact_email || null,
               contact_phone: values.contact_phone || null,
               status: values.status,
            };

            if (isEdit && companyId) {
               const updatedAt = new Date().toISOString();
               await update({
                  id: companyId,
                  company: {
                     ...normalizedPayload,
                     updated_at: updatedAt,
                  },
               });
               reset(values);
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Company updated successfully.');
            } else {
               await create({
                  company: normalizedPayload,
               });
               toast.success('Company created successfully.');
               router.push(ROUTE.ADMIN.COMPANY.SEARCH);
            }
         } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
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

      router.push(ROUTE.ADMIN.COMPANY.SEARCH);
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

