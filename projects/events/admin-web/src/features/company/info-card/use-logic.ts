import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { company } = properties;

   const { translate } = useTranslate({
      prefix: 'features.company.info_card',
   });

   const [state, setState] = useDeepState<Types.State>({
      company,
   });

   return {
      state,
      func: {
         translate,
         setState,
      },
   };
}
