'use client';

import { Briefcase, Building2, Hash, Mail, MapPin, Phone, User } from 'lucide-react';

import { CompanyEditForm } from '@admin-web/features/company/edit-form';

import { CopyButton } from '@admin-web/components/copy-button';
import { StatusBadge } from '@admin-web/components/status-badge';
import { MetaPill } from '@admin-web/components/meta-pill';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CompanyInfoCard: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, func } = useLogic(properties);
   const { root, header, body } = useStyle;

   const contacts: Types.Contact[] = [
      {
         Icon: User,
         label: func.translate('contact_person'),
         value: state.company.contact_person,
         tone: 'primary',
      },
      {
         Icon: Mail,
         label: func.translate('contact_email'),
         value: state.company.contact_email,
         tone: 'info',
         copyable: true,
      },
      {
         Icon: Phone,
         label: func.translate('contact_phone'),
         value: state.company.contact_phone,
         tone: 'success',
         copyable: true,
      },
      {
         Icon: MapPin,
         label: func.translate('contact_address'),
         value: state.company.address,
         tone: 'warning',
      },
   ];

   return (
      <div className={root.wrapper}>
         <div className={root.accent_bar({ status: state.company.status ?? 'SUSPENDED' })} />
         <div className={header.wrapper}>
            <div className={header.logo.wrapper}>
               {state.company.logo_url ? (
                  <img
                     src={state.company.logo_url}
                     className={header.logo.image}
                     width={120}
                     height={120}
                     alt={state.company.name}
                  />
               ) : (
                  <Building2 className={header.logo.icon} />
               )}
            </div>
            <h2 className={header.name}>{state.company.name}</h2>
            <StatusBadge
               className={header.badge}
               status={state.company.status ?? 'SUSPENDED'}
            />
            <MetaPill
               className={header.industry}
               Icon={Briefcase}
               label={func.translate('industry')}
               value={state.company.industry || func.translate('not_specified')}
            />
            <MetaPill
               className={header.tax}
               Icon={Hash}
               label={func.translate('tax_code')}
               value={state.company.tax_code || func.translate('not_specified')}
               copyable
            />
            <CompanyEditForm
               className={header.action}
               company={state.company}
               onUpdate={(updatedCompany) => func.setState({ company: updatedCompany })}
            />
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
