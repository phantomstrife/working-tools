'use client';

import Image from 'next/image';
import { Briefcase, Building2, Check, Copy, Hash, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CompanyInfoCard: Component<Types.Properties> = (properties) => {
   const { company } = properties;

   const { param, func } = useLogic();
   const { root, header, body } = useStyle;

   const scheme = root.scheme({
      status: company.status ?? undefined,
   });

   return <div className={root.wrapper}></div>;
};

//
//          <div className={scheme.accent_bar()} />
//          <div className={header.wrapper}>
//             <div className={header.info.wrapper}>
//                <div className={header.logo.wrapper}>
//                   {company.logo_url ? (
//                      <Image
//                         src={company.logo_url}
//                         className={header.logo.image}
//                         alt={company.name}
//                      />
//                   ) : (
//                      <Building2 className={header.logo.icon} />
//                   )}
//                </div>
//                <h2 className={header.info.name}>{company.name}</h2>
//                <div className={scheme.badge()}>
//                   <span className={scheme.dot()} />
//                   {company.status?.toLocaleLowerCase()}
//                </div>
//                <div className={header.metapill.wrapper({ type: 'industry' })}>
//                   <Briefcase className={header.metapill.icon} />
//                   <span className={header.metapill.title}>{func.translate('industry')}:</span>
//                   <span className={header.metapill.name}>{company.industry || func.translate('not_specified')}</span>
//                </div>
//                <div className={header.metapill.wrapper({ type: 'tax' })}>
//                   <Hash className={header.metapill.icon} />
//                   <span className={header.metapill.title}>{func.translate('tax_code')}:</span>
//                   <span className={header.metapill.name}>{company.tax_code || func.translate('not_specified')}</span>
//                   {company.tax_code && (
//                      <button
//                         type="button"
//                         className={header.metapill.copy_button}
//                         title="Copy Tax Code"
//                         onClick={() => func.handleCopy(company.tax_code, 'tax')}
//                      >
//                         {param.copiedField === 'tax' ? (
//                            <Check className={header.metapill.copy_icon({ copied: true })} />
//                         ) : (
//                            <Copy className={header.metapill.copy_icon({ copied: false })} />
//                         )}
//                      </button>
//                   )}
//                </div>
//             </div>
//             <button
//                type="button"
//                className={header.action.wrapper}
//             >
//                <Pencil className={header.action.icon} />
//                <span>{func.translate('update')}</span>
//             </button>
//          </div>

//          <div className={body.wrapper}>
//             <div className={body.item.wrapper}>
//                <div className={body.item.icon_box({ tone: 'primary' })}>
//                   <User className={body.item.icon} />
//                </div>
//                <div className={body.content.wrapper}>
//                   <span className={body.content.label}>
//                      <span>{func.translate('contact_person')}</span>
//                   </span>
//                   <span
//                      className={body.content.value({ isEmpty: !company.contact_person })}
//                      title={company.contact_person ?? ''}
//                   >
//                      {company.contact_person || func.translate('not_specified')}
//                   </span>
//                </div>
//             </div>
//             <div className={body.item.wrapper}>
//                <div className={body.item.icon_box({ tone: 'info' })}>
//                   <Mail className={body.item.icon} />
//                </div>
//                <div className={body.content.wrapper}>
//                   <span className={body.content.label}>
//                      <span>{func.translate('contact_email')}</span>
//                      {company.contact_email && (
//                         <button
//                            type="button"
//                            className={body.content.copy_button}
//                            title="Copy Email"
//                            onClick={() => func.handleCopy(company.contact_email, 'email')}
//                         >
//                            {param.copiedField === 'email' ? (
//                               <Check className={body.content.copy_icon({ copied: true })} />
//                            ) : (
//                               <Copy className={body.content.copy_icon({ copied: false })} />
//                            )}
//                         </button>
//                      )}
//                   </span>
//                   {company.contact_email ? (
//                      <a
//                         href={`mailto:${company.contact_email}`}
//                         className={body.content.link}
//                         title={company.contact_email}
//                      >
//                         {company.contact_email}
//                      </a>
//                   ) : (
//                      <span className={body.content.value({ isEmpty: true })}>{func.translate('not_specified')}</span>
//                   )}
//                </div>
//             </div>
//             <div className={body.item.wrapper}>
//                <div className={body.item.icon_box({ tone: 'success' })}>
//                   <Phone className={body.item.icon} />
//                </div>
//                <div className={body.content.wrapper}>
//                   <span className={body.content.label}>
//                      <span>{func.translate('contact_phone')}</span>
//                      {company.contact_phone && (
//                         <button
//                            type="button"
//                            className={body.content.copy_button}
//                            title="Copy Phone"
//                            onClick={() => func.handleCopy(company.contact_phone, 'phone')}
//                         >
//                            {param.copiedField === 'phone' ? (
//                               <Check className={body.content.copy_icon({ copied: true })} />
//                            ) : (
//                               <Copy className={body.content.copy_icon({ copied: false })} />
//                            )}
//                         </button>
//                      )}
//                   </span>
//                   <span
//                      className={body.content.value({ isEmpty: !company.contact_phone })}
//                      title={company.contact_phone ?? ''}
//                   >
//                      {company.contact_phone || func.translate('not_specified')}
//                   </span>
//                </div>
//             </div>
//             <div className={body.item.wrapper}>
//                <div className={body.item.icon_box({ tone: 'warning' })}>
//                   <MapPin className={body.item.icon} />
//                </div>
//                <div className={body.content.wrapper}>
//                   <span className={body.content.label}>
//                      <span>{func.translate('address')}</span>
//                   </span>
//                   <span
//                      className={body.content.value({ isEmpty: !company.address })}
//                      title={company.address ?? ''}
//                   >
//                      {company.address || func.translate('not_specified')}
//                   </span>
//                </div>
//             </div>
//          </div>
//       </div>
