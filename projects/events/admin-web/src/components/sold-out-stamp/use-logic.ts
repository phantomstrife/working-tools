import { useTranslate } from '@admin-web/locale';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { label, size = 'md' } = properties;

   const { translate } = useTranslate({
      prefix: 'components.sold_out_stamp',
   });

   return {
      param: {
         size,
         text: label || translate('label'),
      },
   };
}
