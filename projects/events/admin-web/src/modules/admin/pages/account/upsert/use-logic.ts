import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { ROUTE } from '@/constants';
import { getContext } from '@/modules/admin/services/account/get-context';
import { getById } from '@/modules/admin/services/account/get-by-id';
import { create } from '@/modules/admin/services/account/create';
import { update } from '@/modules/admin/services/account/update';

import type { CallerAccount, CompanyOption } from '@/modules/admin/services/account/get-context/type';

export const accountSchema = z.object({
   full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
   email: z.string().trim().email('Please enter a valid email address.'),
   username: z.string().trim().optional().or(z.literal('')),
   phone: z.string().trim().optional().or(z.literal('')),
   password: z
      .string()
      .trim()
      .min(6, 'Password must be at least 6 characters.')
      .optional()
      .or(z.literal('')),
   role: z.enum(['SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD']),
   company_id: z.string().trim().optional().or(z.literal('')),
   status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

export interface AccountAuditMetadata {
   id: string;
   createdBy: string | null;
   createdAt: string | null;
   updatedAt: string | null;
}

export function useLogic(accountIdProp?: string, initialData?: AccountFormValues) {
   const router = useRouter();
   const params = useParams<{ id?: string }>();
   const searchParams = useSearchParams();

   const accountId = accountIdProp ?? (typeof params?.id === 'string' ? params.id : undefined);
   const duplicateId = searchParams?.get('duplicateId') ?? undefined;
   const targetId = accountId ?? duplicateId;
   const isEdit = Boolean(accountId);

   const [isPending, startTransition] = useTransition();
   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [companies, setCompanies] = useState<CompanyOption[]>([]);
   const [loadedTargetId, setLoadedTargetId] = useState<string | null>(null);
   const [loadError, setLoadError] = useState<string>('');
   const [auditMeta, setAuditMeta] = useState<AccountAuditMetadata | null>(null);

   const isLoadingInitial = Boolean(targetId && loadedTargetId !== targetId);
   const isSuperAdmin = caller?.role !== 'ADMIN';

   const form = useForm<AccountFormValues>({
      resolver: zodResolver(accountSchema),
      defaultValues: initialData ?? {
         full_name: '',
         email: '',
         username: '',
         phone: '',
         password: '',
         role: 'FIELD_STAFF',
         company_id: '',
         status: 'ACTIVE',
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
            setCompanies(res.companies);

            if (res.caller?.role === 'ADMIN' && res.caller.company_id && !targetId) {
               setValue('company_id', res.caller.company_id, { shouldDirty: false });
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
         .then(({ account }) => {
            if (!isMounted) return;

            const mappedValues: AccountFormValues = {
               full_name: duplicateId ? `${account.full_name} (Copy)` : account.full_name,
               email: duplicateId ? '' : account.email,
               username: duplicateId ? '' : (account.username ?? ''),
               phone: account.phone ?? '',
               password: '',
               role: account.role,
               company_id: account.company_id ?? '',
               status: account.is_active === false ? 'INACTIVE' : 'ACTIVE',
            };

            setLoadError('');

            if (duplicateId) {
               reset(mappedValues, { keepDefaultValues: true });
            } else {
               reset(mappedValues);
               setAuditMeta({
                  id: account.id,
                  createdBy: account.created_by,
                  createdAt: account.created_at,
                  updatedAt: account.updated_at,
               });
            }
         })
         .catch((err: unknown) => {
            if (!isMounted) return;
            const message = err instanceof Error ? err.message : 'Failed to load account details.';
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
      if (!isEdit && (!values.password || values.password.trim().length < 6)) {
         form.setError('password', {
            message: 'Password is required (at least 6 characters) when creating an account.',
         });
         return;
      }

      startTransition(async () => {
         try {
            const resolvedCompanyId = isSuperAdmin
               ? values.company_id || null
               : (caller?.company_id ?? (values.company_id || null));
            const trimmedPassword = values.password?.trim() ?? '';

            if (isEdit && accountId) {
               const updatedAt = new Date().toISOString();

               await update({
                  id: accountId,
                  account: {
                     full_name: values.full_name,
                     email: values.email,
                     username: values.username || null,
                     phone: values.phone || null,
                     role: values.role,
                     company_id: resolvedCompanyId,
                     is_active: values.status === 'ACTIVE',
                     updated_at: updatedAt,
                  },
                  password: trimmedPassword.length >= 6 ? trimmedPassword : undefined,
               });

               reset({
                  ...values,
                  password: '',
               });
               setAuditMeta((prev) => (prev ? { ...prev, updatedAt } : prev));
               toast.success('Account updated successfully.');
            } else {
               await create({
                  account: {
                     full_name: values.full_name,
                     email: values.email,
                     username: values.username || null,
                     phone: values.phone || null,
                     role: values.role,
                     company_id: resolvedCompanyId,
                     is_active: values.status === 'ACTIVE',
                  },
                  password: trimmedPassword,
               });

               toast.success('Account created successfully.');
               router.push(ROUTE.ADMIN.ACCOUNT.SEARCH);
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

      router.push(ROUTE.ADMIN.ACCOUNT.SEARCH);
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
         reset,
         formatTimestamp,
      },
   };
}

