import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Papa from 'papaparse';
import { toast } from 'sonner';

import { create as createAccount } from '@/modules/admin/services/account/create';
import { deleteById as deleteAccountById } from '@/modules/admin/services/account/delete-by-id';
import { update as updateAccount } from '@/modules/admin/services/account/update';
import { assignGameStaff } from '@/modules/admin/services/company/overview/assign-game-staff';

import type { AssignedStaffMember } from '@/modules/admin/services/company/overview/get-game-workspace/type';

export const staffQuickSchema = z.object({
   full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
   email: z.string().trim().email('Please enter a valid email address.'),
   username: z.string().trim().optional().or(z.literal('')),
   phone: z.string().trim().optional().or(z.literal('')),
   role: z.enum(['FIELD_STAFF', 'GUARD']),
   password: z
      .string()
      .trim()
      .refine((val) => val.length === 0 || val.length >= 6, {
         message: 'Password must be at least 6 characters.',
      }),
   is_active: z.boolean(),
});

export type StaffQuickFormValues = z.infer<typeof staffQuickSchema>;

export type StaffPanelProps = {
   gameId: string;
   eventId: string;
   companyId: string;
   staff: AssignedStaffMember[];
   isLoading: boolean;
   onRefresh: () => Promise<void>;
};

const CSV_INPUT_ID = 'overview-staff-csv-upload-input';

export function useLogic(props: StaffPanelProps) {
   const { gameId, eventId, companyId, staff, isLoading, onRefresh } = props;

   const [searchQuery, setSearchQuery] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingStaff, setEditingStaff] = useState<AssignedStaffMember | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AssignedStaffMember | null>(null);

   const [isPending, startTransition] = useTransition();

   const form = useForm<StaffQuickFormValues>({
      resolver: zodResolver(staffQuickSchema),
      defaultValues: {
         full_name: '',
         email: '',
         username: '',
         phone: '',
         role: 'FIELD_STAFF',
         password: '',
         is_active: true,
      },
      mode: 'onChange',
   });

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = form;

   const filteredStaff = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      if (!normalizedSearch) {
         return staff;
      }

      return staff.filter((member) => {
         const matchesName = member.full_name.toLowerCase().includes(normalizedSearch);
         const matchesPhone = (member.phone ?? '').toLowerCase().includes(normalizedSearch);
         const matchesEmail = member.email.toLowerCase().includes(normalizedSearch);
         return matchesName || matchesPhone || matchesEmail;
      });
   }, [staff, searchQuery]);

   function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSearchQuery(event.target.value);
   }

   function handleClearSearch() {
      setSearchQuery('');
   }

   function handleOpenCreateModal() {
      setEditingStaff(null);
      reset({
         full_name: '',
         email: '',
         username: '',
         phone: '',
         role: 'FIELD_STAFF',
         password: '',
         is_active: true,
      });
      setIsModalOpen(true);
   }

   function handleOpenEditModal(member: AssignedStaffMember) {
      setEditingStaff(member);
      reset({
         full_name: member.full_name,
         email: member.email,
         username: member.username ?? '',
         phone: member.phone ?? '',
         role: member.role === 'GUARD' ? 'GUARD' : 'FIELD_STAFF',
         password: '',
         is_active: member.is_active !== false,
      });
      setIsModalOpen(true);
   }

   function handleCloseModal() {
      if (isPending) return;
      setIsModalOpen(false);
      setEditingStaff(null);
   }

   const onSubmit = handleSubmit((values) => {
      if (!editingStaff && values.password.trim().length < 6) {
         form.setError('password', {
            message: 'Password (min 6 characters) is required when creating a staff account.',
         });
         return;
      }

      startTransition(async () => {
         try {
            if (editingStaff) {
               await updateAccount({
                  id: editingStaff.id,
                  account: {
                     full_name: values.full_name,
                     email: values.email,
                     username: values.username || null,
                     phone: values.phone || null,
                     role: values.role,
                     is_active: values.is_active,
                     updated_at: new Date().toISOString(),
                  },
                  ...(values.password.trim() ? { newPassword: values.password.trim() } : {}),
               });
               toast.success(`Updated staff account "${values.full_name}".`);
            } else {
               const created = await createAccount({
                  account: {
                     full_name: values.full_name,
                     email: values.email,
                     username: values.username || null,
                     phone: values.phone || null,
                     role: values.role,
                     company_id: companyId,
                     is_active: values.is_active,
                  },
                  password: values.password.trim(),
               });

               await assignGameStaff({
                  gameId,
                  eventId,
                  accountIds: [created.account.id],
               });

               toast.success(`Created and assigned staff "${values.full_name}".`);
            }

            setIsModalOpen(false);
            setEditingStaff(null);
            await onRefresh();
         } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to save staff account.';
            form.setError('root', { message });
            toast.error(message);
         }
      });
   });

   function handlePromptDelete(member: AssignedStaffMember) {
      setDeleteTarget(member);
   }

   function handleCancelDelete() {
      setDeleteTarget(null);
   }

   function handleConfirmDelete() {
      if (!deleteTarget) return;
      const target = deleteTarget;
      startTransition(async () => {
         try {
            await deleteAccountById({ id: target.id });
            toast.success(`Deleted staff account "${target.full_name}".`);
            setDeleteTarget(null);
            await onRefresh();
         } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete staff account.');
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
               try {
                  const createdIds: string[] = [];

                  for (const row of rows) {
                     const fullName = (row.full_name ?? row.name ?? row.Name ?? '').trim();
                     const email = (row.email ?? row.Email ?? '').trim();
                     const password = (row.password ?? row.Password ?? 'Staff@123').trim();

                     if (!fullName || !email || password.length < 6) {
                        continue;
                     }

                     const rawRole = (row.role ?? row.Role ?? 'FIELD_STAFF').trim().toUpperCase();
                     const role = rawRole === 'GUARD' ? 'GUARD' : 'FIELD_STAFF';
                     const isActive =
                        (row.is_active ?? 'true').trim().toLowerCase() === 'false' ? false : true;

                     const created = await createAccount({
                        account: {
                           full_name: fullName,
                           email,
                           username: (row.username ?? '').trim() || null,
                           phone: (row.phone ?? row.Phone ?? '').trim() || null,
                           role,
                           company_id: companyId,
                           is_active: isActive,
                        },
                        password,
                     });

                     createdIds.push(created.account.id);
                  }

                  if (createdIds.length === 0) {
                     throw new Error(
                        'No valid staff rows found in CSV (requires "full_name", "email", and optional "password" >= 6 chars).',
                     );
                  }

                  await assignGameStaff({
                     gameId,
                     eventId,
                     accountIds: createdIds,
                  });

                  toast.success(`Imported and assigned ${createdIds.length} staff accounts from CSV.`);
                  await onRefresh();
               } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Failed during staff CSV import.');
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
         totalCount: staff.length,
         filteredStaff,
         isModalOpen,
         isEdit: Boolean(editingStaff),
         deleteTarget,
         isDirty,
         errors,
         csvInputId: CSV_INPUT_ID,
      },
      func: {
         register,
         handleSearchChange,
         handleClearSearch,
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
