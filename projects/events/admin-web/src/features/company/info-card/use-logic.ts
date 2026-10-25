import { useState } from 'react';

import { useTranslate } from '@admin-web/locale';

import type * as Types from './type';

export function useLogic() {
   const { translate } = useTranslate('features.company.info_card');

   const [copiedField, setCopiedField] = useState<string | null>(null);

   const handleCopy: Types.Handle_Copy = (value, fieldName) => {
      if (!value) {
         return;
      }

      navigator.clipboard?.writeText(value);
      setCopiedField(fieldName);

      setTimeout(() => {
         setCopiedField(null);
      }, 1800);
   };

   return {
      param: {
         copiedField,
      },
      func: {
         translate,
         handleCopy,
      },
   };
}
