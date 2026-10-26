import { useDeepState } from '@admin-web/hooks/deep-state';

import type * as Types from './type';

export function useLogic() {
   const [state, setState] = useDeepState<Types.State>({
      executed: false,
   });

   const handleCopy: Types.Handle_Copy = (value) => {
      if (!value) {
         return;
      }

      navigator.clipboard?.writeText(value);
      setState(true, 'executed');

      setTimeout(() => {
         setState(false, 'executed');
      }, 1800);
   };

   return {
      state,
      func: {
         handleCopy,
      },
   };
}
