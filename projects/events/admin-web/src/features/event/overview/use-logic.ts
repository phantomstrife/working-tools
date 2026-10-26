import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import type * as Types from './type';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.event.overview',
   });

   const [state, setState] = useDeepState<Types.State>({
      game: null,
   });

   return {
      state,
      func: {
         translate,
         setState,
      },
   };
}
