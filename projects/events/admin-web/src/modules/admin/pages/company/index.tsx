import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Building2, MapPin, Briefcase, FileText, User, Mail, Phone, ChevronLeft, CalendarX2 } from 'lucide-react';
import CompanyActions from './CompanyActions'; // <-- Import new Client Component

interface CompanyPageProps {
   params: Promise<{
      id: string;
   }>;
}

const getStatusStyles = (status: string) => {
   switch (status) {
      case 'ACTIVE':
         return 'bg-green-50 text-green-700 border-green-200';
      case 'SUSPENDED':
         return 'bg-red-50 text-red-700 border-red-200';
      case 'INACTIVE':
      default:
         return 'bg-gray-50 text-gray-700 border-gray-200';
   }
};

export async function PageAdminCompany({ params }: CompanyPageProps) {
   const { id } = await params;
   const supabase = await createClient();

   const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

   if (error || !data) {
      return (
         <div className="flex flex-col items-center justify-center min-h-100 p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Company Not Found</h2>
            <p className="text-gray-500 mt-2 mb-6">
               The company you are looking for does not exist or an error occurred.
            </p>
            <Link
               href="/companies"
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
               Return to Companies
            </Link>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
         <Link
            href="/companies"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
         >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Companies
         </Link>

         <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{data.name}</h1>
                  <span
                     className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyles(data.status)}`}
                  >
                     {data.status}
                  </span>
               </div>
               <p className="text-sm text-gray-500 font-mono">ID: {data.id}</p>
            </div>

            {/* Injected the Client Component for CRUD interactions */}
            <CompanyActions company={data} />
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-semibold text-gray-900">Company Overview</h2>
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                     <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Tax Code</p>
                        <p className="text-base text-gray-900 mt-0.5">{data.tax_code || 'Not provided'}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Industry</p>
                        <p className="text-base text-gray-900 mt-0.5">{data.industry || 'Not provided'}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-base text-gray-900 mt-0.5">{data.address || 'Not provided'}</p>
                     </div>
                  </div>
               </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-semibold text-gray-900">Primary Contact</h2>
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                     <User className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Contact Person</p>
                        <p className="text-base text-gray-900 mt-0.5">{data.contact_person || 'Not provided'}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        {data.contact_email ? (
                           <a
                              href={`mailto:${data.contact_email}`}
                              className="text-base text-blue-600 hover:underline mt-0.5 block"
                           >
                              {data.contact_email}
                           </a>
                        ) : (
                           <p className="text-base text-gray-900 mt-0.5">Not provided</p>
                        )}
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                     <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        {data.contact_phone ? (
                           <a
                              href={`tel:${data.contact_phone}`}
                              className="text-base text-blue-600 hover:underline mt-0.5 block"
                           >
                              {data.contact_phone}
                           </a>
                        ) : (
                           <p className="text-base text-gray-900 mt-0.5">Not provided</p>
                        )}
                     </div>
                  </div>
               </div>
            </section>
         </div>

         <section>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-gray-900">Events Directory</h2>
            </div>

            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
               <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <CalendarX2 className="w-8 h-8 text-blue-600" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">No Events Found</h3>
               <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                  This company does not have any active or past events configured yet.
               </p>
               <Link href={`/companies/${data.id}/events/new`}>
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                     Create First Event
                  </button>
               </Link>
            </div>
         </section>
      </div>
   );
}
