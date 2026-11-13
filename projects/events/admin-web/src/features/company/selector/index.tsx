'use client';

import { Building2 } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const CompanySelector: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { root, select } = useStyle;

   return (
      <section className={root.wrapper}>
         <FormField
            id="admin-company-select"
            Icon={Building2}
            label={func.translate('label')}
            hint={func.translate('count', { count: param.companies.length })}
         >
            <select
               id="admin-company-select"
               value={param.currentCompanyId}
               onChange={func.handleChangeCompany}
               className={select}
            >
               <option value="">{func.translate('placeholder')}</option>
               {param.companies.map((company) => (
                  <option
                     key={company.id}
                     value={company.id}
                  >
                     {company.name}
                  </option>
               ))}
            </select>
         </FormField>
      </section>
   );
};
