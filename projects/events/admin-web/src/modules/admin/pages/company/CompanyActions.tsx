'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, PlusCircle, X, AlertTriangle, Loader2 } from 'lucide-react';

import { update } from '@/modules/admin/services/company/update';
import { deleteById } from '@/modules/admin/services/company/delete-by-id';

import type { Database } from '@/adapters/supabase/type';

interface Properties {
   company: Database['public']['Tables']['companies']['Row'];
}

export default function CompanyActions({ company }: Properties) {
   const router = useRouter();

   const [isEditOpen, setIsEditOpen] = useState(false);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);

   const [isPendingUpdate, startUpdateTransition] = useTransition();
   const [isPendingDelete, startDeleteTransition] = useTransition();
   const [error, setError] = useState('');

   const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      try {
         startUpdateTransition(async () => {
            const formData = new FormData(e.currentTarget);

            await update({
               id: company.id,
               company: {
                  name: formData.get('name') as string,
                  tax_code: formData.get('tax_code') as string,
                  industry: formData.get('industry') as string,
                  address: formData.get('address') as string,
                  contact_person: formData.get('contact_person') as string,
                  contact_email: formData.get('contact_email') as string,
                  contact_phone: formData.get('contact_phone') as string,
                  status: formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null,
                  updated_at: new Date().toISOString(),
               },
            });

            setIsEditOpen(false);
         });
      } catch (error) {
         setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      }
   };

   const handleDelete = () => {
      setError('');

      try {
         startDeleteTransition(async () => {
            await deleteById({
               id: company.id,
            });
         });
      } catch (error) {
         setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      }
   };

   return (
      <>
         {/* Action Buttons */}
         <div className="flex items-center gap-3">
            <button
               onClick={() => setIsEditOpen(true)}
               className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
               <Edit className="w-4 h-4 mr-2" /> Edit
            </button>
            <button
               onClick={() => setIsDeleteOpen(true)}
               className="inline-flex items-center px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
            >
               <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
            <button
               onClick={() => router.push(`/companies/${company.id}/events/new`)}
               className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
               <PlusCircle className="w-4 h-4 mr-2" /> Create Event
            </button>
         </div>

         {/* Edit Modal */}
         {isEditOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                     <h2 className="text-xl font-semibold text-gray-900">Edit Company</h2>
                     <button
                        onClick={() => setIsEditOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Changed to standard onSubmit */}
                  <form
                     onSubmit={handleUpdate}
                     className="p-6"
                  >
                     {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                           <input
                              required
                              name="name"
                              defaultValue={company.name}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Tax Code</label>
                           <input
                              name="tax_code"
                              defaultValue={company.tax_code ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                           <select
                              name="status"
                              defaultValue={company.status ?? 'SUSPENDED'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                           >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                              <option value="SUSPENDED">SUSPENDED</option>
                           </select>
                        </div>
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                           <input
                              name="industry"
                              defaultValue={company.industry ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                           <input
                              name="address"
                              defaultValue={company.address ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div className="col-span-2 mt-2">
                           <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Contact Information</h3>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                           <input
                              name="contact_person"
                              defaultValue={company.contact_person ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                           <input
                              name="contact_phone"
                              defaultValue={company.contact_phone ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                           <input
                              type="email"
                              name="contact_email"
                              defaultValue={company.contact_email ?? ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                           type="button"
                           onClick={() => setIsEditOpen(false)}
                           className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isPendingUpdate}
                           className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           {isPendingUpdate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                           Save Changes
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {isDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                     <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Company?</h2>
                     <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.
                     </p>

                     {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-left">{error}</div>
                     )}

                     <div className="flex justify-center gap-3">
                        <button
                           onClick={() => setIsDeleteOpen(false)}
                           className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDelete}
                           disabled={isPendingDelete}
                           className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors w-full disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           {isPendingDelete && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                           Yes, Delete
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
