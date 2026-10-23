import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { update } from '@/modules/admin/services/company/update';

import type {
   AccountRole,
   Company,
   CompanyOption,
} from '@/modules/admin/services/company/overview/get-initial-data/type';

export const companyProfileSchema = z.object({
   name: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
   tax_code: z.string().trim().optional().or(z.literal('')),
   industry: z.string().trim().optional().or(z.literal('')),
   contact_person: z.string().trim().optional().or(z.literal('')),
   contact_email: z.string().trim().email('Please enter a valid email address.').optional().or(z.literal('')),
   contact_phone: z.string().trim().optional().or(z.literal('')),
   address: z.string().trim().optional().or(z.literal('')),
   logo_url: z.string().trim().optional().or(z.literal('')),
   status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

export type CompanyInfoCardProps = {
   company: Company;
   callerRole: AccountRole | null;
   companies: CompanyOption[];
   onSwitchCompany: (companyId: string) => void;
   onCompanyUpdated: () => Promise<void>;
};

export function useLogic(props: CompanyInfoCardProps) {
   const { company, callerRole, onCompanyUpdated } = props;

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isPending, startTransition] = useTransition();

   const isSuperAdmin = callerRole === 'SUPER_ADMIN';

   const form = useForm<CompanyProfileFormValues>({
      resolver: zodResolver(companyProfileSchema),
      defaultValues: {
         name: company.name,
         tax_code: company.tax_code ?? '',
         industry: company.industry ?? '',
         contact_person: company.contact_person ?? '',
         contact_email: company.contact_email ?? '',
         contact_phone: company.contact_phone ?? '',
         address: company.address ?? '',
         logo_url: company.logo_url ?? '',
         status: company.status ?? 'ACTIVE',
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = form;

   function handleOpenModal() {
      reset({
         name: company.name,
         tax_code: company.tax_code ?? '',
         industry: company.industry ?? '',
         contact_person: company.contact_person ?? '',
         contact_email: company.contact_email ?? '',
         contact_phone: company.contact_phone ?? '',
         address: company.address ?? '',
         logo_url: company.logo_url ?? '',
         status: company.status ?? 'ACTIVE',
      });
      setIsModalOpen(true);
   }

   function handleCloseModal() {
      if (isPending) return;
      setIsModalOpen(false);
   }

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         try {
            await update({
               id: company.id,
               company: {
                  name: values.name,
                  tax_code: values.tax_code || null,
                  industry: values.industry || null,
                  contact_person: values.contact_person || null,
                  contact_email: values.contact_email || null,
                  contact_phone: values.contact_phone || null,
                  address: values.address || null,
                  logo_url: values.logo_url || null,
                  ...(isSuperAdmin ? { status: values.status } : {}),
                  updated_at: new Date().toISOString(),
               },
            });
            toast.success('Company profile updated successfully.');
            setIsModalOpen(false);
            await onCompanyUpdated();
         } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update company profile.';
            form.setError('root', { message });
            toast.error(message);
         }
      });
   });

   return {
      param: {
         isModalOpen,
         isPending,
         isSuperAdmin,
         isDirty,
         errors,
      },
      func: {
         register,
         handleOpenModal,
         handleCloseModal,
         onSubmit,
      },
   };
}

