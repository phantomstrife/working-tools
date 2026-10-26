'use client';

import Image from 'next/image';
import { Briefcase, Building2, Hash, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';

import { CopyButton } from '@admin-web/components/copy-button';
import { StatusBadge } from '@admin-web/components/status-badge';
import { MetaPill } from '@admin-web/components/meta-pill';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CompanyInfoCard: Component<Types.Properties> = (properties) => {
   const { company } = properties;

   const { func } = useLogic();
   const { root, header, body } = useStyle;

   const contacts: Types.Contact[] = [
      {
         Icon: User,
         label: func.translate('contact_person'),
         value: company.contact_person,
         tone: 'primary',
      },
      {
         Icon: Mail,
         label: func.translate('contact_email'),
         value: company.contact_email,
         tone: 'info',
         copyable: true,
      },
      {
         Icon: Phone,
         label: func.translate('contact_phone'),
         value: company.contact_phone,
         tone: 'success',
         copyable: true,
      },
      {
         Icon: MapPin,
         label: func.translate('contact_address'),
         value: company.address,
         tone: 'warning',
      },
   ];

   return (
      <div className={root.wrapper}>
         <div className={root.accent_bar({ status: company.status ?? 'SUSPENDED' })} />
         <div className={header.wrapper}>
            <div className={header.logo.wrapper}>
               {company.logo_url ? (
                  <Image
                     src={company.logo_url}
                     className={header.logo.image}
                     alt={company.name}
                  />
               ) : (
                  <Building2 className={header.logo.icon} />
               )}
            </div>
            <h2 className={header.name}>{company.name}</h2>
            <StatusBadge
               className={header.badge}
               status={company.status ?? 'SUSPENDED'}
            />
            <MetaPill
               className={header.industry}
               Icon={Briefcase}
               label={func.translate('industry')}
               value={company.industry || func.translate('not_specified')}
            />
            <MetaPill
               className={header.tax}
               Icon={Hash}
               label={func.translate('tax_code')}
               value={company.tax_code || func.translate('not_specified')}
               copyable
            />
            <button
               type="button"
               className={header.action}
            >
               <Pencil size={18} />
            </button>
         </div>

         <div className={body.wrapper}>
            {contacts.map((contact) => {
               const { Icon, label, tone, value, copyable } = contact;

               return (
                  <div
                     key={`contact-${label}-${value}`}
                     className={body.item.wrapper}
                  >
                     <div className={body.item.icon({ tone })}>
                        <Icon size={18} />
                     </div>
                     <div className={body.content.wrapper}>
                        <span className={body.content.label}>{label}</span>
                        <span className={body.content.value({ isEmpty: !value })}>
                           {value || func.translate('not_specified')}
                           {copyable && value && <CopyButton value={value} />}
                        </span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};
